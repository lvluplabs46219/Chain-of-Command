# AI gateway (web)

## Chambers → API

`ChambersView` posts to **`POST /api/ai/lawyer`** with:

- `message`, `jurisdiction`, `agentRole` (selected roster agent)
- `context`: case title, number, court, matter id, charge/evidence counts

## Resolution order

1. **Gemini** — if `GEMINI_API_KEY` is set (`gemini-2.5-flash`).
2. **Ollama** — `OLLAMA_URL` / `OLLAMA_BASE_URL` (default `http://127.0.0.1:11434`), model `OLLAMA_MODEL` / `YHWH_MODEL` (default `llama3.2`).
3. **Template fallback** — educational structured text; `verified: false`, `grounding.status: "template_fallback"`.

## Guardrails (always)

- Prompt-injection / forbidden external-action patterns → 400 + safety message.
- Strip / rewrite “In my legal opinion”.
- Mandatory header/footer: not legal advice; human review required.
- Never claim autonomous filing or court contact.

## Multi-agent runtime (separate)

Local UDS mesh under `agent/multi-agent/`:

- Personas + routing map in `src/protocol/types.ts`
- Raphael handlers: legal.* and code.diagnose|patch|verify|approve
- See `agent/multi-agent/README.md` and root `AGENTS.md`

UI Chambers is **not** yet fully bound to the UDS daemon; it uses the Next route above.
