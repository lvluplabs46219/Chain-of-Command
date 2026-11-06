# In-App Agents (Product Counsel Plane)

**Audience:** Pro se litigants in the Case Workspace  
**Plane:** `in_app`  
**Surface:** Chambers, Directory, Command Center roster, `POST /api/ai/lawyer`

These agents are the **legal assistance personas** that users interact with. They provide educational support only. They are completely separate from the worker / out-of-app agents that operate the platform.

---

## Purpose

- Research and explain charges
- Help organize evidence
- Support court preparation
- Assist with drafting (always for human review)
- Provide rights information and timeline support

**They never file documents, contact courts, or act as attorneys.**

---

## Core Rules

1. Always require human review of any output that could be used in a legal proceeding.
2. Never claim attorney status or give the impression of licensed legal representation.
3. Citations must be grounded or explicitly marked as unverified.
4. Stored with `plane: "in_app"` on `AIAgent` / seed manifests.
5. **Never** receive `shell.exec`, production deploy tools, or direct access to out-of-app workers.
6. **Never** list YHWH, Michael, Gabriel, Raphael, Metatron, or Seraphim in Chambers or Directory.

---

## Example In-App Agents

| Agent | Focus |
|-------|-------|
| Head Legal AI | Overall coordination of counsel-style assistance |
| Legal Research AI | Case law / statute research |
| Paralegal AI | Document and evidence organization |
| Rights Checker AI | Constitutional / procedural rights |
| Charge Explainer AI | Breakdown of charges |
| Court Preparation AI | Hearing / trial prep support |
| Plea Decision Assistant | Educational support around plea options |
| Evidence Organizer AI | Structuring and tagging evidence |
| Drafting AI | Motion / document drafts for human review |
| Timeline AI | Case chronology and deadline awareness |

Exact roster is defined in code (see below). This list is illustrative.

---

## Source of Truth

| What | Where |
|------|-------|
| UI roster | `apps/web/src/lib/workspace-data.ts` → `SPECIALIST_AGENTS_ROSTER` / `getInAppAgents()` |
| Seed / catalog | `packages/agent-runtime/src/catalog.ts` → `SEED_AGENTS` |
| Plane separation rules | `docs/AGENT_PLANES.md` |

---

## Relationship to Worker Agents

```
Litigant UI  →  in-app agent  →  model gateway / RAG  →  structured result + audit

Owner CLI/CI →  out-of-app worker mesh (Michael → Raphael/Gabriel/…) → repo / infra
```

A legal *task kind* may be executed by a worker (e.g. Raphael) as a backend handler, but the **persona the litigant sees and talks to** must always be an in-app agent.

---

## Related Documents

- `docs/AGENT_PLANES.md` — authoritative split between the two planes
- `docs/worker-agents/` — documentation for the out-of-app worker agents (do not mix)
