# Chain of Command — Cloudflare Worker + Hyperdrive (PlanetScale)

Primary app storage and RAG path: **PlanetScale Postgres** via **Cloudflare Hyperdrive**.
Supabase is being phased down to edge functions only where still needed.

Hyperdrive config ID: `307dadda67a042b886fc4241492aac4f`  
Origin host: `aws-us-east-1-2.pg.psdb.cloud` (PlanetScale Postgres)

## Setup

```bash
cd apps/worker
npm install
```

### 1. Hyperdrive origin

Credentials live in the Cloudflare Hyperdrive config (dashboard or CLI), **not** in git.

```bash
npx wrangler hyperdrive update 307dadda67a042b886fc4241492aac4f \
  --connection-string "postgresql://USER:PASSWORD@aws-us-east-1-2.pg.psdb.cloud:5432/postgres?sslmode=require"
```

### 2. Apply schema (once)

Run against PlanetScale (psql, PlanetScale console, or any client):

```bash
psql "$PLANETSCALE_URL" -f sql/001_entitlements_gear_knowledge_packs.sql
```

### 3. Local / deploy

```bash
npm run dev
npm run deploy
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness (no DB) |
| GET | `/` or `/tables` | List public tables |
| GET | `/size` | Table sizes |
| POST | `/equip` | Equip gear (server-side entitlement check) |
| POST | `/checkout` | Base USDC payment record → entitlement grant |
| GET | `/entitlements?subjectType=&subjectId=` | List active grants |
| GET | `/loadout?agentInstanceId=` | Current agent loadout |

### Example: equip

```bash
curl -X POST "$WORKER_URL/equip" -H 'content-type: application/json' -d '{
  "agentInstanceId": "inst-1",
  "agentTitleId": "paralegal",
  "slot": "primary",
  "gearId": "task-stamp",
  "subjectType": "wallet",
  "subjectId": "0xabc..."
}'
```

### Example: checkout

```bash
curl -X POST "$WORKER_URL/checkout" -H 'content-type: application/json' -d '{
  "subjectType": "wallet",
  "subjectId": "0xabc...",
  "skuId": "library-set",
  "amountUsdc": 24,
  "txHash": "0x...",
  "durationDays": 30
}'
```

## Architecture notes

- **AuthZ**: enforced in the Worker (subject_id on requests). No Supabase RLS.
- **Equip**: never trust client-only wallet state; always check `entitlements` (or free baseline gear list).
- **Checkout**: production must verify Base USDC tx to treasury before `confirmed`.
- **gearCatalog**: still `packages/shared/src/gearCatalog.json` for UI chips and SKUs.
- **Knowledge packs**: require `version`, `source`, `last_reviewed`, `verification_stamp` before selling jurisdiction packs.
