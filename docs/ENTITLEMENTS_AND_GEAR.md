# Entitlements, Gear Catalog, and Crypto Checkout (v1)

## Decisions locked

- **Chain**: Base
- **Payment**: USDC (wallet → treasury; non-custodial)
- **NFTs**: ERC-721 for tradable/scarce loadout kits; soulbound option for Official starters
- **Equip**: always server-side (`equip_gear` RPC). Never equip from client-only wallet reads.

## Files

| Path | Role |
|------|------|
| `supabase/migrations/20261111200000_entitlements_gear_knowledge_packs.sql` | Tables + RLS + RPCs |
| `packages/shared/src/gearCatalog.json` | Single source of truth for gear, prefabs, SKUs |
| `packages/shared/src/gearCatalog.ts` | Typed accessors |
| `packages/shared/src/uiSlotLabels.ts` | In hand / Blotter / Drawer / Briefcase labels |
| `packages/shared/src/nftLoadoutMetadata.schema.json` | NFT metadata schema |
| `apps/web/src/app/api/equip/route.ts` | Equip endpoint |
| `apps/web/src/app/api/checkout/route.ts` | Base USDC checkout → entitlement write |

## Knowledge packs

Every row in `knowledge_packs` requires:

- `version`
- `source`
- `last_reviewed`
- `verification_stamp` (jsonb: reviewer, method, confidence)

Do **not** sell jurisdiction packs (e.g. criminal procedure) until a stamped pack row exists.

## Apply migration

```bash
# via Supabase CLI against the project
supabase db push
# or apply the SQL file in the dashboard / scripts/apply_all_migrations.py
```

## Equip flow

1. UI reads `gearCatalog` for chips and default loadouts.
2. User selects gear → `POST /api/equip` with auth.
3. RPC checks entitlement (or free baseline list) → updates `agent_loadouts`.

## Checkout flow

1. Client sends USDC on Base to treasury.
2. `POST /api/checkout` with `txHash`, `skuId`, `subjectId`.
3. Backend records `crypto_payments` (verify tx in production).
4. `grant_entitlement_from_payment` writes `entitlements`.

## NFT kits

Mint with metadata conforming to `nftLoadoutMetadata.schema.json`. Holding the NFT should result in an entitlement row (`source = 'nft'`, `source_ref = token_id` or tx) written by an indexer or claim endpoint — still checked server-side on equip.
