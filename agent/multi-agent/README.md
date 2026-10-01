# Multi-Agent Runtime (Chain of Command)

Implementation of the multi-agent architecture blueprint. Six cooperating layers
running locally on Ubuntu — no `sudo`, all secrets via environment variables.

```
YHWH (Ollama/Lemonade local LLM)
  └── Michael (orchestrator, UDS daemon, state machine)
        ├── Gabriel (messenger agents: events/notifications)
        ├── Raphael  (task bot workers: file/DB/maintenance ops)
        └── Metatron (model gateway)
              └── Seraphim (Google Vertex AI external pool)
```

## Layout

| Path | Component |
|---|---|
| `src/protocol/types.ts` | Shared message envelope + task types (wire contract) |
| `src/transport/uds.ts` | Unix Domain Socket JSON transport (server + client) |
| `src/state/store.ts` | SQLite state cache with optional Supabase sync |
| `src/yhwh/core.ts` | Local LLM reasoning engine (Ollama/Lemonade) |
| `src/michael/orchestrator.ts` | Orchestrator core: state machine + DAG dispatch |
| `src/gabriel/messenger.ts` | Messenger specialists: event routing / payload delivery |
| `src/raphael/worker.ts` | Task bot: built-in task handlers, extensible registry |
| `src/metatron/gateway.ts` | Model gateway: local-vs-external routing + fallback |
| `src/seraphim/vertex.ts` | Seraphim external pool client (Vertex AI) |
| `src/index.ts` | Daemon entrypoint: boots Michael over YHWH |

## Run

```bash
cd agent/multi-agent
cp .env.example .env          # fill in credentials (never hardcode)
npm install
npm run build
npm start                      # starts the Michael daemon on the UDS socket
npm run worker                 # run a Raphael worker against the daemon
npm run send -- "summarize docs"  # dispatch a directive through YHWH
```

## Protocols

- **Transport**: UDS (`/tmp/coc-michael.sock`) with newline-delimited JSON.
  gRPC-loopback is a drop-in upgrade path — the wire contract is identical.
- **State**: SQLite (`~/.local/state/coc/state.db`) synced to Supabase when
  `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` are set. All events emit structured JSON logs.
- **Fallback**: Metatron cascades to YHWH on Seraphim timeout / rate limit
  (configurable, default 30s timeout, 1 retry, then local fallback).
