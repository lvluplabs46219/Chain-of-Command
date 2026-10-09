# Data model notes

## Canonical direction

**Target:** one primary case object — prefer **`matters`** in the web workspace types (`Matter` in `apps/web/src/lib/workspace-data.ts`).

Dual `cases` / `matters` naming in older schemas is **debt**. New features should not introduce a second root entity. Consolidation is a foundation task before Record Room depth.

## Client storage (today)

- Matters / timeline / evidence often in **localStorage** via `workspace-sync.ts` when offline or demo-auth.
- Authenticated path should prefer Supabase RLS tables (apply migrations; wire API).

## Demo vs real

- `isDemoMatter()` / `isDemo: true` on sample matters.
- Master app shows a **DEMO DATA** banner when active matter is sample.
- First run does **not** auto-load sample data.

## Empty matter

`EMPTY_MATTER` (`id: matter-empty`) is the real empty state — no fictional charges, deadlines, or drafts.
