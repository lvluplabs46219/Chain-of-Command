#!/usr/bin/env python3
"""Stage 3: Vulnerability & Bug Scanning Engine (SAST + secrets + Seraphim)."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SAMPLE = ROOT / "sample_app"
ARTIFACTS = ROOT / "artifacts"
sys.path.insert(0, str(ROOT / "pipeline"))

from bots.seraphim import run_seraphim_source  # noqa: E402


def run_bandit() -> list[dict]:
    """Run Bandit (Python SAST) and parse JSON output."""
    cmd = [
        sys.executable, "-m", "bandit",
        "-r", str(SAMPLE / "app.py"),
        "-f", "json",
        "-q",
    ]
    p = subprocess.run(cmd, capture_output=True, text=True)
    findings = []
    try:
        data = json.loads(p.stdout or "{}")
        for r in data.get("results", []):
            findings.append({
                "tool": "bandit",
                "rule_id": r.get("test_id"),
                "message": r.get("issue_text"),
                "severity": r.get("issue_severity"),
                "line": r.get("line_number"),
                "filename": r.get("filename"),
            })
    except json.JSONDecodeError:
        pass
    return findings


def mock_trivy_gitleaks() -> list[dict]:
    """Placeholder for Trivy / Gitleaks / Docker Scout (no Docker / binary here)."""
    return [
        {
            "tool": "trivy-mock",
            "rule_id": "CVE-MOCK-0001",
            "message": "No real container scan (Docker unavailable). Placeholder clean.",
            "severity": "info",
        }
    ]


def main() -> int:
    print("=== Stage 3: Vulnerability & Bug Scanning Engine ===")

    matrix: list[dict] = []

    print("\n--- Static Analysis (SAST) via Bandit ---")
    bandit_findings = run_bandit()
    matrix.extend(bandit_findings)
    for f in bandit_findings:
        print(f"  [{f['severity']}] {f['rule_id']}: {f['message']} (line {f.get('line')})")
    if not bandit_findings:
        print("  [OK] No Bandit findings")

    print("\n--- Dependency & Secret Scan (mock Trivy / Gitleaks) ---")
    matrix.extend(mock_trivy_gitleaks())
    print("  [OK] Mock scan complete")

    print("\n--- Guardrail & Prompt Audit (Seraphim Bot) ---")
    seraphim_findings = run_seraphim_source(ROOT)
    for f in seraphim_findings:
        entry = {
            "tool": "seraphim",
            "rule_id": f.get("rule_id", f.get("type")),
            "message": f.get("message"),
            "severity": f.get("severity", "medium"),
            "line": f.get("line"),
        }
        matrix.append(entry)
        print(f"  [{entry['severity']}] {entry['rule_id']}: {entry['message']}")
    if not seraphim_findings:
        print("  [OK] Seraphim clean")

    out = ARTIFACTS / "vulnerability_matrix.json"
    out.write_text(json.dumps(matrix, indent=2))
    print(f"\nUnified Vulnerability Matrix written to {out}")
    print(f"Total findings: {len(matrix)}")

    # High/critical count for gating
    high = sum(1 for f in matrix if str(f.get("severity", "")).lower() in ("high", "critical"))
    if high:
        print(f"[INFO] {high} high/critical finding(s) – will feed into patch generation.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
