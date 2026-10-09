#!/usr/bin/env python3
"""Stage 1: Environment & Toolchain Sync + Static Typing & Linting + (mock) build."""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SAMPLE = ROOT / "sample_app"
ARTIFACTS = ROOT / "artifacts"
ARTIFACTS.mkdir(exist_ok=True)


def run(cmd: list[str], cwd: Path | None = None) -> tuple[int, str, str]:
    try:
        p = subprocess.run(
            cmd,
            cwd=cwd or SAMPLE,
            capture_output=True,
            text=True,
        )
        return p.returncode, p.stdout, p.stderr
    except FileNotFoundError as e:
        return 127, "", str(e)


def main() -> int:
    os.environ["RUFF_CACHE_DIR"] = "/tmp/ruff_cache"
    Path("/tmp/ruff_cache").mkdir(exist_ok=True)

    report = {
        "stage": "1_build_compile",
        "steps": [],
        "passed": True,
        "errors": [],
    }

    print("=== Stage 1.1: Environment & Toolchain Sync (mock) ===")
    req = SAMPLE / "requirements.txt"
    if req.exists():
        report["steps"].append({"name": "lockfile_check", "status": "ok", "detail": "requirements.txt present"})
        print("  [OK] requirements.txt found")
    else:
        report["passed"] = False
        report["errors"].append("Missing requirements.txt")
        print("  [FAIL] Missing requirements.txt")

    print("\n=== Stage 1.2: Static Typing & Linting ===")

    # Ruff – treat as warning only for the prototype (style nits)
    code, out, err = run([sys.executable, "-m", "ruff", "check", "."])
    step = {"name": "ruff", "status": "ok" if code == 0 else "warn", "stdout": out[:1000], "stderr": err[:500]}
    report["steps"].append(step)
    if code != 0:
        print("  [WARN] ruff reported issues (non-blocking):\n", (out or err)[:600])
    else:
        print("  [OK] ruff clean")

    # Mypy
    code, out, err = run([sys.executable, "-m", "mypy", "--ignore-missing-imports", "app.py"])
    step = {"name": "mypy", "status": "ok" if code == 0 else "fail", "stdout": out, "stderr": err}
    report["steps"].append(step)
    if code != 0:
        report["passed"] = False
        report["errors"].append("mypy failed")
        print("  [FAIL] mypy:\n", out or err)
    else:
        print("  [OK] mypy clean")

    # TypeScript (intentional type error for demo) – optional if tsc not installed
    ts_file = SAMPLE / "index.ts"
    if ts_file.exists():
        code, out, err = run(["tsc", "--noEmit", "index.ts"], cwd=SAMPLE)
        if code == 127:
            report["steps"].append({"name": "tsc", "status": "skipped", "detail": "tsc binary not found"})
            print("  [SKIP] tsc not available in PATH")
        else:
            step = {"name": "tsc", "status": "ok" if code == 0 else "fail", "stdout": out, "stderr": err}
            report["steps"].append(step)
            if code != 0:
                report["passed"] = False
                report["errors"].append("tsc failed")
                print("  [FAIL] tsc:\n", out or err)
            else:
                print("  [OK] tsc clean")

    print("\n=== Stage 1.3: Multi-Stage Container Build (mock) ===")
    report["steps"].append({
        "name": "container_build_mock",
        "status": "ok",
        "detail": "Docker not available in sandbox; static checks treated as build gate",
    })
    print("  [OK] Mock container artifact recorded (no Docker in environment)")

    out_path = ARTIFACTS / "stage1_report.json"
    out_path.write_text(json.dumps(report, indent=2))
    print(f"\nStage 1 report written to {out_path}")

    if not report["passed"]:
        print("\n[FAILURE GATE] Stage 1 had failures (tsc type error is intentional). Continuing for demo.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
