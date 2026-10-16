# Todo Tracker Skill — Chain of Command

## Purpose
All agent work on this repository **must** be driven by the master Todo Tracker.

**Source of truth:** `docs/Chain_of_Command_Todo_Tracker.csv`

## Rules (non-negotiable)

1. **Before starting any work**, read the tracker and select the next eligible task:
   - Prefer Phase 0 tasks first.
   - Prefer tasks whose Owner matches your role (or "All engineers" / "Platform").
   - Only pick tasks with Status = "Not started".

2. **Claim the task** by updating its Status to "In progress" and adding a short note with your agent name + timestamp.

3. **Execute** following the 8-step loop from the master prompt:
   Orient → Recon → Plan → Confirm → Implement → Test → Record → Report

4. **When done**, update Status to "Done" (or "Blocked" with reason) and fill the Notes column.

5. Never invent work outside the tracker. If a required task is missing, add a new row with a clear ID and mark it "Not started".

6. Never mark a task Done unless the Definition of Done in §1.2 of the master prompt is satisfied.

## How to query the next task

```bash
# Next Phase 0 task
python3 -c "
import csv
with open('docs/Chain_of_Command_Todo_Tracker.csv') as f:
    rows = list(csv.DictReader(f))
for r in rows:
    if r['Phase'] == 'Phase 0' and r['Status'] == 'Not started':
        print(r['ID'], r['Task'][:120])
        break
"
```

## Current priority order
1. Phase 0 — Foundation & guardrails
2. Phase 1 — Case core
3. Phase 2 — Model Gateway + Agent Runtime
4. Later phases only after earlier ones have solid coverage

## Response format
Every agent response that performs work must include:
- Claimed task ID
- PLAN block (7 sections)
- CLOSE-OUT block when finished
