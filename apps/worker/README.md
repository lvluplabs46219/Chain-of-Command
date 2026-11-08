# Chain of Command — Cloudflare Worker + Hyperdrive

Edge worker that queries Postgres through **Cloudflare Hyperdrive**.

Hyperdrive config ID: `307dadda67a042b886fc4241492aac4f`  
Intended origin: PlanetScale Postgres (`chain-of-command` / `aws-us-east-1-2.pg.psdb.cloud`)

## Setup

```bash
cd apps/worker
npm install
```

### 1. Point Hyperdrive at PlanetScale

In Cloudflare dashboard → Hyperdrive → this config, set the origin to your PlanetScale role connection string:

```text
postgresql://postgres.<BRANCH_ID>:<PASSWORD>@aws-us-east-1-2.pg.psdb.cloud:5432/postgres?sslmode=require
```

Or via CLI (after creating a PlanetScale role):

```bash
npx wrangler hyperdrive update 307dadda67a042b886fc4241492aac4f \
  --connection-string "postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require"
```

### 2. Local dev

```bash
npm run dev
```

### 3. Deploy

```bash
npm run deploy
```

## Endpoints

| Path | Description |
|------|-------------|
| `/health` | Liveness (no DB) |
| `/` or `/tables` | List public tables |
| `/size` | Table sizes (top 20) |

## Note on migration

This worker only **connects**. Data still lives on Supabase until you run `pg_dump` → `pg_restore` into PlanetScale.
