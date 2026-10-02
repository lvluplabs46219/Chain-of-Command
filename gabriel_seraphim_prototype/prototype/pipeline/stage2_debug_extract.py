#!/usr/bin/env python3
"""Stage 2: Runtime Debugging & Failure Extraction.

Runs pytest, captures failures, and writes a DebugContext JSON
that Gabriel-Code Bot will later consume.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SAMPLE = ROOT / "sample_app"
ARTIFACTS = ROOT / "artifacts"
ARTIFACTS.mkdir(exist_ok=True)


def run_pytest() -> tuple[int, str, str]:
    # Prefer json-report plugin if available
    cmd = [
        sys.executable, "-m", "pytest",
        "test_app.py",
        "-v",
        "--tb=short",
        "--json-report",
        f"--json-report-file={ARTIFACTS / 'pytest_report.json'}",
    ]
    p = subprocess.run(cmd, cwd=SAMPLE, capture_output=True, text=True)
    if "unrecognized arguments" in (p.stderr or "") or "unrecognized arguments" in (p.stdout or ""):
        # Fallback without the plugin
        cmd = [
            sys.executable, "-m", "pytest",
            "test_app.py",
            "-v",
            "--tb=short",
        ]
        p = subprocess.run(cmd, cwd=SAMPLE, capture_output=True, text=True)
    return p.returncode, p.stdout, p.stderr


def extract_from_json(pytest_json_path: Path) -> list[dict]:
    if not pytest_json_path.exists():
        return []
    data = json.loads(pytest_json_path.read_text())
    contexts = []
    for test in data.get("tests", []):
        if test.get("outcome") != "failed":
            continue
        call = test.get("call", {})
        longrepr = call.get("longrepr", "") or test.get("longrepr", "")
        contexts.append({
            "test_name": test.get("nodeid", "unknown"),
            "outcome": "failed",
            "traceback": longrepr if isinstance(longrepr, str) else str(longrepr),
            "duration": test.get("duration"),
            "stage": "call",
            "failing_inputs": {},
            "environment": {
                "python": sys.version,
                "cwd": str(SAMPLE),
            },
        })
    return contexts


def extract_from_stdout(stdout: str) -> list[dict]:
    """Fallback parser when json-report is unavailable."""
    contexts = []
    # Simple heuristic: look for FAILED lines and following assert blocks
    failed_tests = re.findall(r"^(test_app\.py::\S+)\s+FAILED", stdout, re.MULTILINE)
    for name in failed_tests:
        # Grab a chunk of traceback if present
        tb_match = re.search(
            rf"{re.escape(name)}.*?((?:E\s+.*\n)+)",
            stdout,
            re.DOTALL,
        )
        tb = tb_match.group(1).strip() if tb_match else f"Test {name} failed"
        contexts.append({
            "test_name": name,
            "outcome": "failed",
            "traceback": tb,
            "duration": None,
            "stage": "call",
            "failing_inputs": {},
            "environment": {
                "python": sys.version,
                "cwd": str(SAMPLE),
            },
        })
    return contexts


def main() -> int:
    print("=== Stage 2: Vitest / Pytest Execution Engine ===")
    code, out, err = run_pytest()
    print(out)
    if err and "unrecognized arguments" not in err:
        print(err, file=sys.stderr)

    report_path = ARTIFACTS / "pytest_report.json"
    contexts = extract_from_json(report_path)
    if not contexts:
        contexts = extract_from_stdout(out)

    primary = contexts[0] if contexts else {
        "test_name": "none",
        "outcome": "passed",
        "traceback": "",
        "message": "All tests passed",
    }

    debug_path = ARTIFACTS / "debug_context.json"
    debug_path.write_text(json.dumps(primary, indent=2))

    all_path = ARTIFACTS / "all_debug_contexts.json"
    all_path.write_text(json.dumps(contexts, indent=2))

    print(f"\nExtracted {len(contexts)} failure context(s)")
    print(f"Primary DebugContext written to {debug_path}")

    if code != 0:
        print("[INFO] Failures detected – Gabriel-Code Bot will be invoked downstream.")
        return 1
    print("[OK] All tests passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
