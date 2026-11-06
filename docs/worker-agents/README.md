# Worker Agents (Out-of-App / Owner DevOps Plane)

**Audience:** Platform owner / engineer only  
**Plane:** `out_of_app`  
**Must never appear in Chambers, Directory, or any litigant-facing UI**

These agents exist to **build, diagnose, patch, verify, migrate, and operate** the Chain of Command platform itself. They are infrastructure and repair workers — not legal counsel.

---

## Hierarchy & Roles

| Agent | Role | Primary Responsibilities |
|-------|------|---------------------------|
| **Seraphim** | Diagnostic | Scan environment, run tests, produce failure matrix, external inference pool |
| **Gabriel** | Messenger / Patcher | Generate patches, notify, deliver results |
| **Michael** | Orchestrator / Verifier | Dispatch tasks (DAG), verify patches in E2B (or local fallback), coordinate workers |
| **YHWH** | Policy Gate | Final governance, safety rules, approve/reject before commit or merge |
| **Raphael** | Task Worker | Shell execution, file scaffolding, DB migrations, workspace maintenance, dispatched legal *task kinds* (backend only) |
| **Metatron** | Model Gateway | Provider routing and fallback |

### Canonical flow (repair / verification loop)

```
Seraphim (diagnose) → Gabriel (patch) → Michael (verify in E2B) → YHWH (policy gate) → commit/merge
```

Michael can also act as the central orchestrator that dispatches work to Raphael and others.

---

## Key Implementation Locations

| Component | Location |
|-----------|----------|
| Divine hierarchy (Python) | Separate repo: `divine-agent-architecture` (`agents/seraphim.py`, `gabriel.py`, `michael.py`, `yhwh.py`) |
| Multi-agent mesh (TypeScript) | `agent/multi-agent/` |
| Protocol types | `agent/multi-agent/src/protocol/types.ts` (`OutOfAppWorkerName`, `TaskKind`) |
| Edge Function dispatcher | Supabase: `dispatch-to-michael` |
| CourtListener workers | Supabase Edge Functions: `courtlistener-search`, `courtlistener-sync`, `courtlistener-webhook`, `cold-cases-stream-ingest` |
| Agent sync / skills | `.agents/` |

---

## Hard Rules

1. **Never** present these agents in the product UI as counsel or case team.
2. **Never** give in-app agents `shell.exec`, production deploy tools, or direct access to these workers.
3. Legal *task kinds* (e.g. `legal.motion_draft`) may be executed by Raphael as a **backend handler**, but the persona the litigant sees must remain an **in-app agent**.
4. All worker agents carry `plane: "out_of_app"`.
5. Secrets and infra access go through env / Infisical — never hard-coded into product agents.

---

## Related Documents

- `docs/AGENT_PLANES.md` — authoritative plane separation rules
- `docs/AUTOMATED_PATCH_VERIFICATION_LOOP.md` — detailed repair loop
- `docs/agents/` — additional agent reference material
- `agent/multi-agent/README.md` — TypeScript mesh documentation

---

## Individual Agent Specs

See the files in this directory:

- [Seraphim](./seraphim.md)
- [Gabriel](./gabriel.md)
- [Michael](./michael.md)
- [YHWH](./yhwh.md)
- [Raphael & Metatron](./raphael-metatron.md)
- [Edge Worker Functions](./edge-functions.md)
