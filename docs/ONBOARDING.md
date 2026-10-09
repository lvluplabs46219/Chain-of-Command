# First-run onboarding

## Behavior

- Flag: `localStorage.coc_onboarding_completed` (`"1"` when done).
- Auth: `isFirstRun`, `completeFirstRun()`, `resetFirstRun()` in `apps/web/src/contexts/AuthContext.tsx`.
- UI: `apps/web/src/components/onboarding/FirstRunWizard.tsx`.
- DB (optional sync): `supabase/migrations/20261009_onboarding_progress.sql`.

## Wizard steps (current)

1. **Welcome + boundaries** — required checkbox (not a law firm, no autonomous filing, 988).
2. **Profile** — name, optional email, jurisdiction.
3. **Matter** — create real matter, explore **sample** (DEMO), or empty workspace.

## Fresh first-login (browser)

```js
localStorage.removeItem("coc_onboarding_completed");
localStorage.removeItem("acquit_auth_user");
localStorage.removeItem("acquit_auth_token");
localStorage.removeItem("chain_of_command_matters");
Object.keys(localStorage)
  .filter((k) => k.startsWith("chain_of_command_") || k.startsWith("coc_"))
  .forEach((k) => localStorage.removeItem(k));
location.reload();
```

Or `resetClientOnboarding({ clearMatters: true })` from `apps/web/src/lib/onboarding-reset.ts`.

Prefer a **second test account** or incognito for true new-user paths. Do not delete production case rows to simulate onboarding.

## Supabase reset (after migration applied)

```sql
delete from public.onboarding_progress where user_id = '<auth-uid>';
```
