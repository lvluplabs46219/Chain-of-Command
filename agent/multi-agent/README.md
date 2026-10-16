# Multi-Agent Runtime (Chain of Command)

Implementation of the multi-agent architecture blueprint. Six cooperating layers
running locally on Ubuntu — no sudo, all secrets via environment variables.

```
YHWH (Ollama/Lemonade local LLM)
  └── Michael (orchestrator, UDS daemon, state machine)
        ├── Gabriel (messenger agents: events/notifications)
        ├── Raphael  (task bot workers: file/DB/maintenance + legal workflows + code repair)
        └── Metatron (model gateway)
              └── Seraphim (Google Vertex AI external pool)
```

## Specialized Legal Agent Personas

These names are first-class in the protocol and route through the hierarchy:

- head_counsel → Michael (strategy & planning)
- paralegal → Raphael (drafting, organization, deadlines)
- rights_checker → Raphael (constitutional / procedural rights flags)
- timeline_spotter → Raphael (chronology + contradiction detection)
- charge_explainer → Metatron (plain-language charge analysis)
- research_counsel → Seraphim (statute / case law retrieval + citation)
- court_prep → Raphael (appearance kits, questions, checklists)
- document_analyst → Raphael (evidence / filing analysis)

## Legal Task Kinds (Raphael)

- legal.charge_explain
- legal.brady_demand
- legal.court_prep_kit
- legal.timeline_build
- legal.contradiction_scan
- legal.deadline_check
- legal.motion_draft
- legal.document_analyze
- legal.evidence_organize
- legal.rights_check

## Divine Code-Repair Pipeline (merged)

Synced from divine-agent-architecture:

```
code.diagnose  →  code.patch  →  code.verify  →  code.approve
(Seraphim)        (Gabriel)       (Michael)       (YHWH)
```

These task kinds are registered on Raphael and orchestrated by Michael as a DAG.

## Layout

- src/protocol/types.ts — Shared message envelope + task types
- src/transport/uds.ts — Unix Domain Socket JSON transport
- src/state/store.ts — SQLite state cache + optional Supabase sync
- src/yhwh/core.ts — Local LLM reasoning engine
- src/michael/orchestrator.ts — Orchestrator core (state machine + DAG)
- src/gabriel/messenger.ts — Messenger specialists
- src/raphael/worker.ts — Task bot (legal + code-repair + builtins)
- src/metatron/gateway.ts — Model gateway
- src/seraphim/vertex.ts — Vertex AI external pool
- src/index.ts — Daemon entrypoint

## Run

```bash
cd agent/multi-agent
cp .env.example .env
npm install
npm run build
npm start
npm run worker
npm run send -- "summarize docs"
```

## Protocols

- Transport: UDS (/tmp/coc-michael.sock) with newline-delimited JSON
- State: SQLite (~/.local/state/coc/state.db) synced to Supabase when configured
- Fallback: Metatron cascades to YHWH on Seraphim timeout / rate limit
