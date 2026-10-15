# Multi-Agent Runtime (Chain of Command)

Build-time agent workers (not the in-app legal AI personas). Six cooperating layers:

```
YHWH (Lemonade / Ollama Cloud / local Ollama)
  └── Michael (orchestrator, UDS daemon, state machine)
        ├── Gabriel (messenger: events/notifications)
        ├── Raphael  (task workers: file/shell + legal workflows + code repair)
        └── Metatron (model gateway)
              └── Seraphim (Google Vertex AI external pool — optional)
```

## LLM setup (required)

YHWH tries providers in this order unless you force one with `LLM_PROVIDER`:

| Priority | Provider | When |
|----------|----------|------|
| 1 | **Lemonade Server** | Local GPU/NPU at `http://127.0.0.1:13305` |
| 2 | **Ollama Cloud** | Free-tier models via `OLLAMA_API_KEY` |
| 3 | **Ollama local** | Daemon at `http://127.0.0.1:11434` |

### Option A — Lemonade Server (recommended local)

1. Install: https://lemonade-server.ai  
2. Pull a coding model, e.g. `lemonade-server pull Qwen2.5-7B-Instruct-GGUF`  
3. Start: `lemonade-server serve`  
4. In `.env` leave `LLM_PROVIDER` empty (auto) or set `LLM_PROVIDER=lemonade`

### Option B — Ollama Cloud free models

1. Create an account at https://ollama.com  
2. Create an API key: https://ollama.com/settings/keys  
3. Put it in `.env`:

```bash
OLLAMA_API_KEY=your_key_here
OLLAMA_CLOUD_MODEL=gpt-oss:20b   # free-tier friendly
# or: gpt-oss:120b | gemma4:31b | nemotron-3-nano
```

4. Optional force: `LLM_PROVIDER=ollama-cloud`

No local install needed for cloud-only use.

### Option C — Local Ollama

```bash
ollama pull qwen2.5:7b
# ensure ollama serve is running
LLM_PROVIDER=ollama
```

## Run the workers

```bash
cd agent/multi-agent
cp .env.example .env
# edit .env — at minimum set OLLAMA_API_KEY if using cloud
npm install
npm run build
npm start          # Michael daemon on /tmp/coc-michael.sock

# another terminal — send a build directive
npm run send -- "run the test suite and fix any failures"
npm run worker    # optional dedicated worker process
```

## Specialized legal personas (routed through this hierarchy)

- head_counsel → Michael  
- paralegal / rights_checker / timeline_spotter / court_prep / document_analyst → Raphael  
- charge_explainer → Metatron  
- research_counsel → Seraphim  

## Divine code-repair pipeline

```
code.diagnose → code.patch → code.verify → code.approve
(Seraphim)      (Gabriel)     (Michael)     (YHWH)
```

Registered on Raphael; Michael runs them as a DAG.

## Layout

- `src/protocol/types.ts` — message envelope + task types  
- `src/transport/uds.ts` — Unix Domain Socket JSON transport  
- `src/state/store.ts` — SQLite state + optional Supabase sync  
- `src/yhwh/core.ts` — local/cloud LLM reasoning (Lemonade + Ollama Cloud)  
- `src/michael/orchestrator.ts` — state machine + DAG  
- `src/gabriel/messenger.ts` — events  
- `src/raphael/worker.ts` — task bots  
- `src/metatron/gateway.ts` — model router  
- `src/seraphim/vertex.ts` — Vertex AI pool  
- `src/index.ts` — daemon entrypoint  

## Protocols

- Transport: UDS (`/tmp/coc-michael.sock`) newline-delimited JSON  
- State: SQLite (`~/.local/state/coc/state.db`)  
- Fallback: Metatron cascades Seraphim → YHWH on timeout/rate limit  
