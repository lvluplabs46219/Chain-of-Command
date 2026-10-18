# The Firm

The Firm is the Acquit.ai AI-agent playground (formerly "empyrean"): a multi-agent orchestration kernel where AI counsel — powered by custom open-weight models — plan, orchestrate, and execute directives in a Telegram-style workspace.

## Agents (AI Counsel)
- **YHWH** — Lead Counsel (planning kernel, Hermes 3 8B)
- **Michael** — Managing Partner (orchestrator)
- **Metatron** — Research Scribe (model gateway / router)
- **Raphael** — Case Prep Specialist (worker)
- **Gabriel** — Client Relations (messenger / webhooks)
- **Seraphim** — Appellate Oracle (heavy-tier reasoning, Hermes 3 70B)

## Run
```bash
npm install
cp .env.example .env
npm run dev   # serves The Firm dashboard at http://localhost:3000
```

Message a specific counsel: `http://localhost:3000/?agent=yhwh`
The Counsel Directory in the main Acquit.ai app links each AI attorney here.
