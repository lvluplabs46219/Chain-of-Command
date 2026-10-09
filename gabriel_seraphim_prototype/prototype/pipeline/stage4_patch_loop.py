#!/usr/bin/env python3
"""Stage 4: Automated Patch Generation & Verification Loop.

Gabriel generates a patch → Seraphim audits it → isolated re-test →
commit (in-memory for prototype) or escalate.
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SAMPLE = ROOT / "sample_app"
ARTIFACTS = ROOT / "artifacts"
sys.path.insert(0, str(ROOT / "pipeline"))

from bots.gabriel import GabrielCodeBot, run_gabriel  # noqa: E402
from bots.seraphim import run_seraphim_patch  # noqa: E402


def apply_patch_to_dir(patch: str, target_dir: Path) -> bool:
    """Very simple patch applier (expects the exact old/new blocks we generate)."""
    # For this prototype we re-implement the known fixes rather than a full patch(1)
    # because our diff is simplified. In a real system we would use `git apply` or `patch`.
    app = target_dir / "app.py"
    if not app.exists():
        return False
    src = app.read_text()

    bot = GabrielCodeBot(ROOT)
    # Re-use the same transformation logic by checking which patch it is
    if "return items[::-1]" in patch:
        # reverse_list fix
        old_block = '''def reverse_list(items: List[int]) -> List[int]:
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
    return reversed_items'''
        new_block = '''def reverse_list(items: List[int]) -> List[int]:
    """Reverse a list of integers."""
    if not items:
        return []
    return items[::-1]'''
        if old_block in src:
            app.write_text(src.replace(old_block, new_block))
            return True

    if "Cannot divide by zero" in patch:
        old_block = '''def safe_divide(a: float, b: float) -> float:
    """Divide a by b. Missing zero check (runtime failure)."""
    return a / b  # Bug: ZeroDivisionError possible'''
        new_block = '''def safe_divide(a: float, b: float) -> float:
    """Divide a by b. Raises ValueError on zero divisor."""
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b'''
        if old_block in src:
            app.write_text(src.replace(old_block, new_block))
            return True

    if "Only numeric literals allowed" in patch:
        old_block = '''def process_user_input(raw: str) -> str:
    """Process user input. Intentionally unsafe for Seraphim demo."""
    # Bug: direct eval of untrusted input (SAST / Seraphim should catch)
    result = eval(raw)
    return str(result)'''
        new_block = '''def process_user_input(raw: str) -> str:
    """Process user input safely (only simple arithmetic literals)."""
    # Restricted: only allow integer literals via ast
    try:
        tree = ast.parse(raw, mode="eval")
        if not isinstance(tree.body, ast.Constant) or not isinstance(tree.body.value, (int, float)):
            raise ValueError("Only numeric literals allowed")
        return str(tree.body.value)
    except Exception as e:
        raise ValueError(f"Invalid input: {e}")'''
        if old_block in src:
            # Need to ensure `import ast` is present
            if "import ast" not in src:
                src = "import ast\n" + src
            app.write_text(src.replace(old_block, new_block))
            return True

    return False


def run_tests_in(dir_path: Path) -> tuple[int, str]:
    cmd = [sys.executable, "-m", "pytest", "test_app.py", "-v", "--tb=line"]
    p = subprocess.run(cmd, cwd=dir_path, capture_output=True, text=True)
    return p.returncode, p.stdout + p.stderr


def main() -> int:
    print("=== Stage 4: Automated Patch Generation & Verification Loop ===")

    debug_path = ARTIFACTS / "debug_context.json"
    vuln_path = ARTIFACTS / "vulnerability_matrix.json"

    if not debug_path.exists() and not vuln_path.exists():
        print("No debug context or vulnerability matrix found. Nothing to patch.")
        return 0

    print("\n--- Gabriel-Code Bot: generating minimal patch ---")
    patch = run_gabriel(debug_path, vuln_path, ROOT)

    if not patch:
        print("  [INFO] Gabriel could not produce an automatic patch for the current failure.")
        print("  Escalating to YHWH (human / higher-level planner).")
        (ARTIFACTS / "escalation.txt").write_text(
            "No automatic patch generated. Manual intervention required.\n"
        )
        return 2

    patch_path = ARTIFACTS / "proposed_patch.diff"
    patch_path.write_text(patch)
    print(f"  [OK] Patch written to {patch_path}")
    print(patch[:500] + ("..." if len(patch) > 500 else ""))

    print("\n--- Seraphim Bot: inspecting patch for new leaks ---")
    audit = run_seraphim_patch(ROOT, patch)
    if not audit["clean"]:
        print("  [FAIL] Seraphim rejected the patch:")
        for issue in audit["issues"]:
            print(f"    - {issue}")
        (ARTIFACTS / "escalation.txt").write_text(
            "Seraphim rejected patch:\n" + "\n".join(audit["issues"])
        )
        return 2
    print("  [OK] Seraphim audit passed")

    print("\n--- Isolated Sandbox Test ---")
    with tempfile.TemporaryDirectory(prefix="gabriel_sandbox_") as tmp:
        tmp_path = Path(tmp)
        # Copy sample_app into sandbox
        shutil.copytree(SAMPLE, tmp_path / "sample_app")
        sandbox_app = tmp_path / "sample_app"

        if not apply_patch_to_dir(patch, sandbox_app):
            print("  [FAIL] Could not apply patch inside sandbox")
            return 1

        print("  Patch applied in sandbox. Re-running tests...")
        code, output = run_tests_in(sandbox_app)
        print(output[-1500:] if len(output) > 1500 else output)

        if code != 0:
            print("  [FAIL] Tests still failing after patch. Escalating to YHWH.")
            (ARTIFACTS / "escalation.txt").write_text(
                "Sandbox tests failed after patch application.\n" + output[-2000:]
            )
            return 2

        print("  [OK] Sandbox tests passed")

    # "Commit" the patch for the prototype (write a fixed copy)
    print("\n--- Commit / Auto-Merge (prototype) ---")
    fixed_dir = ARTIFACTS / "fixed_sample_app"
    if fixed_dir.exists():
        shutil.rmtree(fixed_dir)
    shutil.copytree(SAMPLE, fixed_dir)
    apply_patch_to_dir(patch, fixed_dir)
    print(f"  [OK] Fixed sources written to {fixed_dir}")
    print("  In a real system this would create a Git commit or open a PR.")

    summary = {
        "status": "patched",
        "patch_file": str(patch_path),
        "seraphim_clean": True,
        "sandbox_passed": True,
        "fixed_sources": str(fixed_dir),
    }
    (ARTIFACTS / "stage4_summary.json").write_text(json.dumps(summary, indent=2))
    print("\n[SUCCESS] Automated remediation complete.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
