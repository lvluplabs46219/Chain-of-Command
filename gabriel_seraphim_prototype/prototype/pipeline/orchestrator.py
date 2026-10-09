#!/usr/bin/env python3
"""Minimal end-to-end orchestrator for the Gabriel / Seraphim pipeline prototype."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PIPELINE = ROOT / "pipeline"


def run_stage(script: str) -> int:
    print("\n" + "=" * 60)
    print(f"RUNNING {script}")
    print("=" * 60)
    cmd = [sys.executable, str(PIPELINE / script)]
    p = subprocess.run(cmd)
    return p.returncode


def main() -> int:
    print("Gabriel-Code / Seraphim Automated Remediation Pipeline – Minimal Prototype")
    print(f"Project root: {ROOT}")

    # Stage 1 – always run
    rc1 = run_stage("stage1_lint_build.py")
    # We continue even on failure for demo purposes

    # Stage 2 – test + extract
    rc2 = run_stage("stage2_debug_extract.py")

    # Stage 3 – scan
    rc3 = run_stage("stage3_scan.py")

    # Stage 4 – only if there is something to fix
    if rc2 != 0 or rc3 != 0:
        rc4 = run_stage("stage4_patch_loop.py")
    else:
        print("\nNo failures or high-severity findings – skipping patch generation.")
        rc4 = 0

    print("\n" + "=" * 60)
    print("PIPELINE SUMMARY")
    print("=" * 60)
    print(f"  Stage 1 (lint/build) : {'PASS' if rc1 == 0 else 'FAIL/WARN'}")
    print(f"  Stage 2 (tests)      : {'PASS' if rc2 == 0 else 'FAIL'}")
    print(f"  Stage 3 (scan)      : {'PASS' if rc3 == 0 else 'FINDINGS'}")
    print(f"  Stage 4 (patch)      : {'PASS' if rc4 == 0 else 'ESCALATED/FAIL'}")

    if rc4 == 0 and (rc2 != 0 or rc3 != 0):
        print("\nResult: Automated patch generated and verified.")
    elif rc4 == 2:
        print("\nResult: Escalated to YHWH (manual review required).")
    elif rc2 == 0 and rc3 == 0:
        print("\nResult: Clean run – nothing to remediate.")
    else:
        print("\nResult: Pipeline finished with residual issues.")

    return 0 if rc4 in (0, 2) else 1


if __name__ == "__main__":
    sys.exit(main())
