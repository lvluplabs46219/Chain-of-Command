# Chain of Command

AI-powered legal self-representation workspace and case intelligence platform for pro se litigants.

This monorepo contains the core platform: frontend workspace, API server, RAG engine, court connectors, multi-agent runtime, and security models.

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
