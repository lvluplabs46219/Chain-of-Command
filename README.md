# Acquit.ai — Legal AI Case Workspace

Acquit.ai is an AI-powered legal self-representation and legal-access platform designed for pro se litigants. This monorepo contains the core platform, including the frontend workspace, API server, RAG engine, court connectors, and security models.

## Repository Structure

```
acquit-platform/
├── apps/
│   ├── web/           # Next.js / Vite React frontend (Case Workspace)
│   └── api/           # Express backend services
├── packages/
│   ├── db/            # Database schemas, migrations, and Drizzle config
│   ├── rag-engine/    # Retrieval-Augmented Generation & Vector DB logic
│   ├── connectors/    # CourtListener & third-party integrations
│   ├── workflow/      # Background job logic
│   └── security/      # Security, compliance, and auditing agents
├── scripts/           # Utilities, ingest scripts, and database tooling
└── supabase/          # Supabase configurations and raw SQL migrations
```

## Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [Python 3](https://www.python.org/) (for DB tooling & scripts)
- [npm](https://www.npmjs.com/) or `pnpm`
- [Supabase CLI](https://supabase.com/docs/guides/cli) (Optional, for local DB development)

### 2. Installation
```bash
# Clone the repository
git clone <repo-url>
cd acquit-platform

# Install dependencies across all workspaces
npm install
```

### 3. Environment Configuration
Copy the `.env.example` file to `.env` and fill in your keys:
```bash
cp .env.example .env
```
Ensure you have your `DATABASE_URL` and `GEMINI_API_KEY` set.

### 4. Database Setup
Ensure your local or remote Supabase instance is running.
```bash
# Push schema changes via Drizzle
npm run db:push

# Or run the manual migrations script (Python)
npm run db:migrate
```

### 5. Start the Development Servers
```bash
# Starts both the web frontend and API server concurrently
npm run dev
```

## Scripts & Tools
- `npm run typecheck`: Run TypeScript compilation check across all packages.
- `npm run lint`: Lint the codebase.
- `npm run ingest`: Run the CourtListener docket ingestion script.

## Core Product Principles
- **No Autonomous Filing**: The AI cannot file documents or take legal action automatically.
- **Citation Grounding**: All legal claims must cite verifiable statutes or case law.
- **Privacy & Auditability**: User data is strictly isolated, and AI actions are logged via the SIC Audit module.

For more details on architectural rules, see `AGENTS.md`.
