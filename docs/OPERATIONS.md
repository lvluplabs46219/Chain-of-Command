# Operations cheat sheet

## Dev

```bash
cd ~/Development/Repos/Chain-of-Command
npm install
npm run dev          # web on :3000
# optional: apps/api separately if using Express routes without rewrite
```

## Secrets

See [INFISICAL_SETUP.md](./INFISICAL_SETUP.md).

```bash
npm run secrets:agent
```

## Database migrations (Supabase)

```bash
ls supabase/migrations/
# Apply via Supabase dashboard SQL or CLI against the target project
```

Notable recent migrations:

- `20261009_coc_execution_graphs_and_audit_trail.sql`
- `20261009_match_legal_chunks_rpc.sql`
- `20261009_onboarding_progress.sql`

## Production (Vercel)

- App: `apps/web` (Next.js)
- Env: set Supabase, optional Gemini, never commit secrets
- After deploy: Lighthouse in **incognito** (extensions skew TBT)

## Performance notes

- Workspace views are `next/dynamic` code-split.
- `fetch-guard.js` loads `afterInteractive`.
- CSP + `X-Frame-Options: DENY` set in `apps/web/next.config.mjs`.
- Prefer system fonts; avoid new Google Fonts `@import` on critical path.

## Safety product rules

- AI does not file, submit, or contact courts.
- Draft ≠ Final; external actions require human gate.
- Sample/explore data must show **DEMO DATA**.
- Real case data must not live in demo/staging seeds.
