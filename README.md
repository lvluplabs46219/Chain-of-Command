# Chain of Command

AI-powered legal self-representation workspace and case intelligence platform for pro se litigants.

This monorepo contains the core platform: frontend workspace, API server, RAG engine, court connectors, multi-agent runtime, and security models.


## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/OPERATIONS.md](docs/OPERATIONS.md) | Dev, deploy, safety rules |
| [docs/INFISICAL_SETUP.md](docs/INFISICAL_SETUP.md) | Machine identity + agent secrets |
| [docs/ONBOARDING.md](docs/ONBOARDING.md) | First-run wizard and reset |
| [docs/AI_GATEWAY.md](docs/AI_GATEWAY.md) | Chambers → Gemini/Ollama/templates |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Matters, demo vs real, empty state |
| [docs/SESSION_2026-10-09.md](docs/SESSION_2026-10-09.md) | What shipped this session |
| [docs/CHAIN_OF_COMMAND_ARCHITECTURE.md](docs/CHAIN_OF_COMMAND_ARCHITECTURE.md) | Verification architecture |
| [AGENTS.md](AGENTS.md) | Product build principles + agent team |
| [agent/multi-agent/README.md](agent/multi-agent/README.md) | Local multi-agent runtime |
| [SECURITY.md](SECURITY.md) | Security policy |

## Repository Structure

```
Chain-of-Command/
├── apps/
│   ├── web/           # Next.js frontend (Case Workspace)
│   └── api/           # Express backend services
├── packages/
│   ├── db/            # Database schemas, migrations, and Drizzle config
│   ├── rag-engine/    # Retrieval-Augmented Generation & vector logic
│   ├── connectors/    # CourtListener & third-party integrations
│   ├── agent-sdk/     # Shared agent contracts
│   ├── audit/         # Audit hash-chain utilities
│   ├── shared/        # Shared types and utilities
│   └── security/      # Security, compliance, and auditing agents
├── agent/
│   └── multi-agent/   # YHWH / Michael / Gabriel / Raphael / Metatron / Seraphim runtime
├── scripts/           # Utilities, ingest scripts, and database tooling
├── docs/              # Architecture, ADRs, and operational docs
├── config/            # Team templates and static config data
└── supabase/          # Supabase configurations and SQL migrations
```

## Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [Python 3](https://www.python.org/) (for DB tooling & scripts)
- npm
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for local DB development)

### 2. Installation
```bash
git clone https://github.com/lvluplabs46219/Chain-of-Command.git
cd Chain-of-Command
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
```
Set at least `DATABASE_URL` / Supabase keys and any LLM provider keys you need.

### 4. Database Setup
```bash
# Push schema changes via Drizzle
npm run db:push

# Or run the manual migrations script (Python)
npm run db:migrate
```

### 5. Start Development
```bash
npm run dev
```

## Scripts
- `npm run typecheck` — TypeScript check across packages
- `npm run lint` — Lint the web workspace
- `npm run ingest` — CourtListener ingestion

## Core Product Principles
- **No Autonomous Filing**: The AI cannot file documents or take legal action automatically.
- **Citation Grounding**: Legal claims must cite verifiable statutes or case law.
- **Privacy & Auditability**: User data is isolated; AI actions are logged via the audit module.

For agent/architecture rules see `AGENTS.md` and `docs/`.
