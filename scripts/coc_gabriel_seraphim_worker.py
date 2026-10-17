#!/usr/bin/env python3
"""Gabriel + Seraphim worker driven by docs/Chain_of_Command_Todo_Tracker.csv.

Flow (AGENTS.md + todo-tracker skill):
  1. Pick next Not started task (Phase 0 first unless --phase / --id)
  2. Claim → In progress
  3. Gabriel: Orient + 7-part PLAN against the live monorepo
  4. Seraphim: audit plan for §2 invariants / security boundaries
  5. Write artifacts under docs/agent_runs/<ID>/
  6. Update Notes; leave Status In progress (or Blocked if Seraphim rejects)
     — never auto-Done without human verification of §1.2 DoD

Usage:
  python3 scripts/coc_gabriel_seraphim_worker.py
  python3 scripts/coc_gabriel_seraphim_worker.py --phase "Phase 0"
  python3 scripts/coc_gabriel_seraphim_worker.py --id COC-242
  python3 scripts/coc_gabriel_seraphim_worker.py --dry-run
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TRACKER = ROOT / "docs" / "Chain_of_Command_Todo_Tracker.csv"
RUNS = ROOT / "docs" / "agent_runs"

# Reuse prototype client (Lemonade-first)
PROTO_BOTS = ROOT / "gabriel_seraphim_prototype" / "prototype" / "pipeline" / "bots"
sys.path.insert(0, str(PROTO_BOTS))
from ollama_client import (  # noqa: E402
    GABRIEL_MODEL,
    SERAPHIM_MODEL,
    chat,
    chat_json,
    resolve_backend,
)

PHASE_ORDER = [
    "Phase 0",
    "Phase 1",
    "Phase 2",
    "Phase 3",
    "Phase 4",
    "Phase 5",
    "Phase 6",
    "Phase 7",
    "Phase 8",
    "All phases",
]


def load_tracker() -> list[dict]:
    with open(TRACKER, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def save_tracker(rows: list[dict]) -> None:
    if not rows:
        return
    fieldnames = list(rows[0].keys())
    with open(TRACKER, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)


def phase_rank(p: str) -> int:
    try:
        return PHASE_ORDER.index(p)
    except ValueError:
        return 99


def pick_task(
    rows: list[dict],
    phase: str | None,
    task_id: str | None,
    owner: str | None,
) -> dict | None:
    if task_id:
        for r in rows:
            if r.get("ID") == task_id:
                return r
        return None
    candidates = [
        r
        for r in rows
        if r.get("Status", "").strip() == "Not started"
        and (not phase or r.get("Phase") == phase)
        and (not owner or owner in (r.get("Owner") or ""))
    ]
    candidates.sort(key=lambda r: (phase_rank(r.get("Phase") or ""), r.get("ID") or ""))
    return candidates[0] if candidates else None


def recon_snippet(max_chars: int = 4000) -> str:
    """Lightweight repo recon for Gabriel context."""
    bits: list[str] = []
    for rel in (
        "package.json",
        "AGENTS.md",
        "apps/api/package.json",
        "apps/web/package.json",
        "packages/shared/package.json",
        "packages/auth/package.json",
        "packages/audit/package.json",
        "docs/PHASE0_CHECKLIST.md",
    ):
        p = ROOT / rel
        if p.exists():
            text = p.read_text(encoding="utf-8", errors="replace")[:800]
            bits.append(f"### {rel}\n{text}")
    # package dirs
    pkgs = sorted((ROOT / "packages").glob("*")) if (ROOT / "packages").exists() else []
    bits.append("### packages/\n" + ", ".join(x.name for x in pkgs if x.is_dir()))
    apps = sorted((ROOT / "apps").glob("*")) if (ROOT / "apps").exists() else []
    bits.append("### apps/\n" + ", ".join(x.name for x in apps if x.is_dir()))
    out = "\n\n".join(bits)
    return out[:max_chars]


def gabriel_plan(task: dict) -> dict:
    system = (
        "You are Gabriel-Code, senior implementer for the Chain of Command legal-tech platform. "
        "Follow AGENTS.md and the master prompt invariants. "
        "Never fabricate citations, court integrations, or attorney recommendations. "
        "Never propose autonomous filing/serving/contacting. "
        "Respond ONLY with JSON matching this schema:\n"
        "{\n"
        '  "orient": "feature + user-visible outcome + constraining invariants",\n'
        '  "plan": {\n'
        '    "context": "...",\n'
        '    "files_affected": ["path", ...],\n'
        '    "dependencies": ["..."],\n'
        '    "database_changes": "none or description",\n'
        '    "api_changes": "none or description",\n'
        '    "security_implications": "...",\n'
        '    "testing_requirements": "..."\n'
        "  },\n"
        '  "implementation_steps": ["ordered concrete steps"],\n'
        '  "requires_human_approval": true/false,\n'
        '  "capability_not_verified": ["items or empty"]\n'
        "}"
    )
    user = (
        f"## Task\n{json.dumps(task, indent=2)}\n\n"
        f"## Repo recon (partial)\n{recon_snippet()}\n\n"
        "Produce the PLAN for this single tracker task only. "
        "Prefer extending existing packages under apps/ and packages/."
    )
    print(f"  [Gabriel] model={GABRIEL_MODEL} backend={resolve_backend()}")
    result = chat_json(GABRIEL_MODEL, system, user, temperature=0.15, timeout=300)
    if "_parse_error" in result:
        # one free-form retry then wrap
        raw = chat(GABRIEL_MODEL, system, user, temperature=0.1, timeout=300)
        result = {"_raw": raw, "_parse_error": result["_parse_error"], "orient": raw[:500]}
    return result


def seraphim_audit(task: dict, plan: dict) -> dict:
    system = (
        "You are Seraphim, security and legal-guardrail auditor for Chain of Command. "
        "Reject plans that: fabricate legal authority; auto-file/submit/serve/contact; "
        "recommend attorneys; weaken RLS/auth; treat model output as instruction; "
        "or skip human approval for external legal actions. "
        "Respond ONLY with JSON: "
        '{"clean": true/false, "issues": ["..."], "required_gates": ["..."]}'
    )
    user = (
        f"## Task\n{json.dumps(task, indent=2)}\n\n"
        f"## Gabriel plan\n{json.dumps(plan, indent=2)[:6000]}\n"
    )
    print(f"  [Seraphim] model={SERAPHIM_MODEL}")
    result = chat_json(SERAPHIM_MODEL, system, user, temperature=0.0, timeout=180)
    if "_parse_error" in result:
        return {"clean": False, "issues": ["Seraphim parse failure — human review required"], "required_gates": ["manual"]}
    return result


def main() -> int:
    ap = argparse.ArgumentParser(description="Gabriel/Seraphim CoC tracker worker")
    ap.add_argument("--phase", default=None, help='e.g. "Phase 0"')
    ap.add_argument("--id", default=None, help="Claim specific COC-###")
    ap.add_argument("--owner", default=None, help="Filter by Owner substring")
    ap.add_argument("--dry-run", action="store_true", help="Do not update tracker")
    ap.add_argument("--agent-name", default="gabriel-seraphim-worker")
    args = ap.parse_args()

    if not TRACKER.exists():
        print(f"Tracker missing: {TRACKER}", file=sys.stderr)
        return 1

    rows = load_tracker()
    task = pick_task(rows, args.phase, args.id, args.owner)
    if not task:
        print("No matching task.")
        return 0

    tid = task["ID"]
    print("=" * 60)
    print(f"Claimed: {tid}")
    print(f"Phase:   {task.get('Phase')}")
    print(f"Section: {task.get('Section')}")
    print(f"Task:    {task.get('Task')}")
    print("=" * 60)

    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ")
    if not args.dry_run and task.get("Status") == "Not started":
        task["Status"] = "In progress"
        note = f"[{args.agent_name} {ts}] claimed"
        task["Notes"] = (task.get("Notes") or "").strip()
        task["Notes"] = f"{task['Notes']}; {note}".strip("; ")
        save_tracker(rows)
        print(f"  Tracker → In progress")

    plan = gabriel_plan(task)
    audit = seraphim_audit(task, plan)

    run_dir = RUNS / tid
    run_dir.mkdir(parents=True, exist_ok=True)
    (run_dir / "plan.json").write_text(json.dumps(plan, indent=2))
    (run_dir / "seraphim.json").write_text(json.dumps(audit, indent=2))
    (run_dir / "task.json").write_text(json.dumps(task, indent=2))

    print("\n--- PLAN (Gabriel) ---")
    print(json.dumps(plan, indent=2)[:3000])
    print("\n--- AUDIT (Seraphim) ---")
    print(json.dumps(audit, indent=2)[:1500])
    print(f"\nArtifacts: {run_dir}")

    if not args.dry_run:
        if audit.get("clean") is False:
            task["Status"] = "Blocked"
            issues = "; ".join(audit.get("issues") or [])[:400]
            task["Notes"] = f"{(task.get('Notes') or '')}; [{ts}] Seraphim blocked: {issues}".strip("; ")
            print("  Tracker → Blocked (Seraphim)")
        else:
            task["Notes"] = (
                f"{(task.get('Notes') or '')}; [{ts}] plan+audit written to docs/agent_runs/{tid}/ "
                f"(Status stays In progress until human verifies §1.2 DoD)"
            ).strip("; ")
        # write back matching row
        for i, r in enumerate(rows):
            if r.get("ID") == tid:
                rows[i] = task
                break
        save_tracker(rows)

    print(
        "\nCLOSE-OUT: plan produced; implementation not auto-applied. "
        "Review docs/agent_runs/%s/ then implement or re-run with human oversight." % tid
    )
    return 0 if audit.get("clean", True) else 2


if __name__ == "__main__":
    raise SystemExit(main())
