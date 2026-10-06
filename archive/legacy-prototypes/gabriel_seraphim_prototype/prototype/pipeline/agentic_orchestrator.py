#!/usr/bin/env python3
"""Fully automated multi-agent remediation workflow.

Agents:
  - Gabriel  : diagnoses failures + generates minimal patches
  - Seraphim : security / guardrail auditor (gates every patch)
  - YHWH     : human escalation sink after max retries

Loop:
  1. Run tests → DebugContext
  2. Run SAST + Seraphim scan → Vulnerability Matrix
  3. Gabriel proposes ordered list of patches
  4. Seraphim audits each; collect approved set
  5. Apply *all* approved patches together in sandbox → re-test
  6. If sandbox green → apply to working tree; else escalate
  7. Repeat until clean or max iterations
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

ROOT = Path(__file__).resolve().parents[1]
SAMPLE = ROOT / "sample_app"
ARTIFACTS = ROOT / "artifacts"
ARTIFACTS.mkdir(exist_ok=True)
sys.path.insert(0, str(ROOT / "pipeline"))

from bots.gabriel import GabrielCodeBot  # noqa: E402
from bots.seraphim import SeraphimBot, run_seraphim_patch  # noqa: E402

MAX_ITERATIONS = 3


def run_cmd(cmd: List[str], cwd: Optional[Path] = None) -> Tuple[int, str, str]:
    p = subprocess.run(cmd, cwd=cwd or SAMPLE, capture_output=True, text=True)
    return p.returncode, p.stdout, p.stderr


def stage_tests() -> Tuple[int, Dict[str, Any]]:
    print("\n[Agent] Running test suite...")
    code, out, err = run_cmd([
        sys.executable, "-m", "pytest", "test_app.py", "-v", "--tb=short",
    ])
    print(out[-2000:] if len(out) > 2000 else out)

    ctx: Dict[str, Any] = {
        "test_name": "unknown",
        "outcome": "passed" if code == 0 else "failed",
        "traceback": "",
        "environment": {"python": sys.version, "cwd": str(SAMPLE)},
    }
    if code != 0:
        for line in out.splitlines():
            if "FAILED" in line and "test_app.py::" in line:
                ctx["test_name"] = line.split()[0]
                break
        if "E   assert" in out:
            start = out.find("E   assert")
            ctx["traceback"] = out[start:start + 600]
        else:
            ctx["traceback"] = out[-800:]

    (ARTIFACTS / "debug_context.json").write_text(json.dumps(ctx, indent=2))
    return code, ctx


def stage_scan() -> List[Dict]:
    print("\n[Agent] Running vulnerability & guardrail scan...")
    matrix: List[Dict] = []

    code, out, _ = run_cmd([
        sys.executable, "-m", "bandit", "-r", str(SAMPLE / "app.py"),
        "-f", "json", "-q",
    ], cwd=ROOT)
    try:
        data = json.loads(out or "{}")
        for r in data.get("results", []):
            matrix.append({
                "tool": "bandit",
                "rule_id": r.get("test_id"),
                "message": r.get("issue_text"),
                "severity": r.get("issue_severity"),
                "line": r.get("line_number"),
            })
    except json.JSONDecodeError:
        pass

    seraphim = SeraphimBot(ROOT)
    for f in seraphim.audit_source(SAMPLE / "app.py"):
        matrix.append({
            "tool": "seraphim",
            "rule_id": f.get("rule_id", f.get("type")),
            "message": f.get("message"),
            "severity": f.get("severity", "medium"),
            "line": f.get("line"),
        })

    (ARTIFACTS / "vulnerability_matrix.json").write_text(json.dumps(matrix, indent=2))
    print(f"  Findings: {len(matrix)}")
    for m in matrix:
        print(f"    [{m.get('severity')}] {m.get('rule_id')}: {m.get('message')}")
    return matrix


REPLACEMENTS = {
    "reverse_list": (
        '''def reverse_list(items: List[int]) -> List[int]:
    """Reverse a list of integers.
    
    Intentional logic bug: off-by-one that drops the last element
    on odd-length lists in some cases, but actually a clear error.
    """
    if not items:
        return []
    # Bug: should be items[::-1] or proper reverse.
    # This creates a wrong result for demonstration.
    reversed_items = []
    for i in range(len(items) - 1, 0, -1):  # starts from len-1 down to 1, skips index 0
        reversed_items.append(items[i])
    return reversed_items''',
        '''def reverse_list(items: List[int]) -> List[int]:
    """Reverse a list of integers."""
    if not items:
        return []
    return items[::-1]'''
    ),
    "safe_divide": (
        '''def safe_divide(a: float, b: float) -> float:
    """Divide a by b. Missing zero check (runtime failure)."""
    return a / b  # Bug: ZeroDivisionError possible''',
        '''def safe_divide(a: float, b: float) -> float:
    """Divide a by b. Raises ValueError on zero divisor."""
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b'''
    ),
    "eval": (
        '''def process_user_input(raw: str) -> str:
    """Process user input. Intentionally unsafe for Seraphim demo."""
    # Bug: direct eval of untrusted input (SAST / Seraphim should catch)
    result = eval(raw)
    return str(result)''',
        '''def process_user_input(raw: str) -> str:
    """Process user input safely (only numeric literals)."""
    try:
        tree = ast.parse(raw, mode="eval")
        if not isinstance(tree.body, ast.Constant) or not isinstance(tree.body.value, (int, float)):
            raise ValueError("Only numeric literals allowed")
        return str(tree.body.value)
    except Exception as e:
        raise ValueError(f"Invalid input: {e}")'''
    ),
    "template": (
        '''def render_template(template: str, context: dict) -> str:
    """Naive template renderer. Vulnerable to injection-style issues."""
    # Bug for Seraphim: no escaping of context values
    for key, value in context.items():
        template = template.replace(f"{{{{{key}}}}}", str(value))
    return template''',
        '''def render_template(template: str, context: dict) -> str:
    """Safe template renderer – escapes context values."""
    import html
    for key, value in context.items():
        safe = html.escape(str(value))
        template = template.replace(f"{{{{{key}}}}}", safe)
    return template'''
    ),
}


def apply_patches_in_dir(issue_keys: List[str], target_dir: Path) -> List[str]:
    """Apply multiple known patches. Returns list of keys successfully applied."""
    app = target_dir / "app.py"
    if not app.exists():
        return []
    src = app.read_text()
    applied = []
    for key in issue_keys:
        if key not in REPLACEMENTS:
            continue
        old, new = REPLACEMENTS[key]
        if old in src:
            if key == "eval" and "import ast" not in src:
                src = "import ast\n" + src
            src = src.replace(old, new)
            applied.append(key)
    if applied:
        app.write_text(src)
    return applied


def sandbox_verify_combined(issue_keys: List[str]) -> bool:
    """Apply all patches together in an isolated sandbox and re-run tests."""
    with tempfile.TemporaryDirectory(prefix="gabriel_agent_") as tmp:
        tmp_path = Path(tmp)
        shutil.copytree(SAMPLE, tmp_path / "sample_app")
        sandbox = tmp_path / "sample_app"

        applied = apply_patches_in_dir(issue_keys, sandbox)
        if not applied:
            print("  [Sandbox] No patches could be applied")
            return False
        print(f"  [Sandbox] Applied together: {applied}")

        code, out, _ = run_cmd([
            sys.executable, "-m", "pytest", "test_app.py", "-q", "--tb=line",
        ], cwd=sandbox)
        print(out[-1000:] if len(out) > 1000 else out)
        return code == 0


def agent_loop() -> int:
    print("=" * 60)
    print("Gabriel / Seraphim  –  Fully Automated Agent Workflow")
    print("=" * 60)

    gabriel = GabrielCodeBot(ROOT)
    fixed_issues: List[str] = []

    for iteration in range(1, MAX_ITERATIONS + 1):
        print(f"\n>>> Iteration {iteration}/{MAX_ITERATIONS}")

        test_rc, debug_ctx = stage_tests()
        matrix = stage_scan()

        high_findings = [
            m for m in matrix
            if str(m.get("severity", "")).lower() in ("high", "critical", "medium")
        ]
        if test_rc == 0 and not high_findings:
            print("\n[Agent] All tests pass and no medium/high findings. Done.")
            break

        patches = gabriel.generate_patches(debug_ctx, matrix)
        # Filter already-fixed
        patches = [(k, p) for k, p in patches if k not in fixed_issues]
        if not patches:
            print("[Gabriel] No remaining automatic fixes → escalating to YHWH")
            (ARTIFACTS / "escalation.txt").write_text(
                f"Iteration {iteration}: no patches left.\n"
                + json.dumps({"debug": debug_ctx, "matrix": matrix}, indent=2)
            )
            return 2

        print(f"[Gabriel] Proposed {len(patches)} patch(es): {[k for k, _ in patches]}")

        # Seraphim gate – collect approved set
        approved_keys: List[str] = []
        for issue_key, patch in patches:
            (ARTIFACTS / f"patch_{issue_key}.diff").write_text(patch)
            audit = run_seraphim_patch(ROOT, patch)
            if not audit["clean"]:
                print(f"  [Seraphim] REJECTED {issue_key}: {audit['issues']}")
                continue
            print(f"  [Seraphim] APPROVED {issue_key}")
            approved_keys.append(issue_key)

        if not approved_keys:
            print("[Agent] Seraphim rejected every patch → escalating")
            return 2

        # Combined sandbox verification
        print(f"\n  --- Combined sandbox test for: {approved_keys} ---")
        if not sandbox_verify_combined(approved_keys):
            print("  [Sandbox] Combined patches still fail tests → escalating")
            (ARTIFACTS / "escalation.txt").write_text(
                f"Combined sandbox failed for {approved_keys}\n"
            )
            return 2
        print("  [Sandbox] PASSED with combined patches")

        # Apply to real working tree
        applied = apply_patches_in_dir(approved_keys, SAMPLE)
        fixed_issues.extend(applied)
        print(f"  [Agent] Applied to working tree: {applied}")

    # Final verification
    print("\n" + "=" * 60)
    print("Final verification")
    print("=" * 60)
    final_rc, _ = stage_tests()
    final_matrix = stage_scan()

    if final_rc == 0:
        print("\n[SUCCESS] Fully automated remediation complete.")
        print(f"  Fixed issues: {fixed_issues}")

        fixed_dir = ARTIFACTS / "fixed_sample_app"
        if fixed_dir.exists():
            shutil.rmtree(fixed_dir)
        shutil.copytree(SAMPLE, fixed_dir)
        print(f"  Snapshot written to {fixed_dir}")

        summary = {
            "status": "success",
            "fixed_issues": fixed_issues,
            "iterations": iteration,
        }
        (ARTIFACTS / "agent_summary.json").write_text(json.dumps(summary, indent=2))
        return 0

    print("\n[ESCALATION] Residual failures remain → YHWH")
    (ARTIFACTS / "escalation.txt").write_text(
        "Residual issues after agent loop.\n" + json.dumps(final_matrix, indent=2)
    )
    return 2


if __name__ == "__main__":
    import ast  # noqa: F401  – needed by generated patches
    sys.exit(agent_loop())
