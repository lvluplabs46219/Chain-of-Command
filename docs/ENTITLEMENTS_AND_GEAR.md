# Entitlements, Gear Catalog, and Crypto Checkout (v1)

## Storage decision (current)

| Layer | Role |
|-------|------|
| **PlanetScale Postgres** via **Hyperdrive** | Main storage + RAG + entitlements |
| **Cloudflare Worker** (`apps/worker`) | Equip, checkout, entitlement reads |
| **Supabase** | Phasing down — edge functions only where still required |
| **packages/shared gearCatalog** | UI source of truth for gear / SKUs / prefabs |

## Chain / payments

- **Chain**: Base
- **Token**: USDC (wallet → treasury; non-custodial)
- **NFTs**: ERC-721 kits; metadata schema in `packages/shared/src/nftLoadoutMetadata.schema.json`

## Schema

Apply on PlanetScale:

```bash
psql "$PLANETSCALE_URL" -f apps/worker/sql/001_entitlements_gear_knowledge_packs.sql
```

Tables: `knowledge_packs`, `entitlements`, `agent_loadouts`, `crypto_payments`.

Authorization is **app-layer** in the Worker (not Supabase RLS).

## Worker API

See `apps/worker/README.md`.

- `POST /equip` — server-side entitlement check + loadout update
- `POST /checkout` — record Base USDC payment; grant entitlement when confirmed
- `GET /entitlements` — list active grants for subject

## Knowledge packs

Do not sell jurisdiction packs until a row exists with:

- `version`, `source`, `last_reviewed`, `verification_stamp`

## UI

- Slot labels: `packages/shared/src/uiSlotLabels.ts`
- Catalog: `packages/shared/src/gearCatalog.json`
