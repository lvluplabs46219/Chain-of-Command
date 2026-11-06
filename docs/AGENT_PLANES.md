# Agent planes — in-app vs out-of-app

Chain of Command has **two agent planes**. They must not be mixed in the product UI.

## 1. In-app agents (product counsel)

**Audience:** pro se litigants in the Case Workspace.

**Surface:** Chambers, Directory, Command Center roster, `POST /api/ai/lawyer`.

**Purpose:** educational legal assistance only — research, charge explanation, evidence organization, court prep, drafting for human review.

**Rules:**
- Always require human review; never claim attorney status.
- No autonomous filing, court contact, or external legal action.
- Citations must be grounded or marked unverified.
- Stored as `plane: "in_app"` on `AIAgent` / seed manifests.

**Examples:** Head Legal AI, Legal Research AI, Paralegal AI, Rights Checker AI, Charge Explainer AI, Court Preparation AI, Plea Decision Assistant, Evidence Organizer AI, Drafting AI, Timeline AI.

Source of truth for UI roster:
- `apps/web/src/lib/workspace-data.ts` → `SPECIALIST_AGENTS_ROSTER` / `getInAppAgents()`
- `packages/agent-runtime/src/catalog.ts` → `SEED_AGENTS`

**Detailed documentation:** [`docs/in-app-agents/`](./in-app-agents/)

## 2. Out-of-app agents (owner devops workers)

**Audience:** you (platform owner / engineer) only.

**Surface:** local multi-agent mesh under `agent/multi-agent/` (UDS), CLI workers, CI/automation — **never** Chambers counsel chips.

**Purpose:** build, diagnose, patch, verify, migrate, and operate the application itself.

| Worker | Role | Typical tasks |
|--------|------|----------------|
| **YHWH** | Local reasoning / policy gate | `llm.reason`, `code.approve` |
| **Michael** | Orchestrator | DAG dispatch, `code.verify` |
| **Gabriel** | Messenger | `notify`, `code.patch`, deliver |
| **Raphael** | Task worker | `shell.exec`, `file.scaffold`, `db.migrate`, `workspace.maintain`, legal task handlers when dispatched |
| **Metatron** | Model gateway | provider route / fallback |
| **Seraphim** | External pool | `code.diagnose`, cloud inference |

**Rules:**
- `plane: "out_of_app"` — excluded from litigant-facing rosters.
- May touch repo, CI, migrations, and infra secrets (via env / Infisical).
- Must not be presented as the user's lawyer or case team.
- Legal *task kinds* (e.g. `legal.motion_draft`) may run on Raphael as **backend handlers**, but the **persona the litigant sees** remains an in-app agent.

Source of truth:
- `agent/multi-agent/src/protocol/types.ts` → `AgentName`, `TaskKind`
- `agent/multi-agent/README.md`
- `OUT_OF_APP_WORKER_AGENTS` in `workspace-data.ts` (inventory only; not UI counsel)

**Detailed documentation:** [`docs/worker-agents/`](./worker-agents/)

## 3. Routing rule

```
Litigant UI  →  in_app agent  →  model gateway / RAG  →  structured result + audit
Owner CLI/CI →  out_of_app worker mesh (Michael → Raphael/Gabriel/…) → repo/infra
```

Do **not** list YHWH, Michael, Gabriel, Raphael, Metatron, or Seraphim in Chambers.
Do **not** give in-app agents `shell.exec` or production deploy tools.

## 4. Definition of done for this split

- [x] Documented planes (this file)
- [x] `AIAgent.plane` on product types + `getInAppAgents` / `getOutOfAppWorkers`
- [x] Directory rolodex uses only in-app agents
- [x] Protocol types separate `OutOfAppWorkerName` vs `InAppLegalPersonaName`
- [x] AGENTS.md + multi-agent README point here
- [x] Dedicated directories: `docs/worker-agents/` and `docs/in-app-agents/`
