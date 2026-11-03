# Service Account & Secret Key Rotation

## Principles

- No long-lived end-user API keys in the client.
- Service accounts are per-tenant, scoped (`scopes` jsonb), rotatable, and audited.
- Secrets live in Infisical / environment — never in git or browser storage.

## Service account rotation (database)

1. **Create new key**  
   Insert a new `service_accounts` row with a new `key_id`, same `tenant_id` and reduced scopes if possible. Store the secret hash/material only in the secret manager (not in Postgres plaintext).

2. **Deploy consumers**  
   Point background jobs / connectors to the new key via secret manager version bump.

3. **Verify**  
   Confirm `last_used_at` updates on the new row; zero traffic on the old row.

4. **Disable old**  
   `UPDATE service_accounts SET is_active = false WHERE key_id = '<old>';`

5. **Delete after grace**  
   After ≥ 7 days (or one full job cycle), delete the inactive row and purge secret versions.

Only tenant **admin+** can mutate `service_accounts` (RLS).

## Supabase / platform secrets

| Secret | Rotation |
|--------|----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Rotate in Supabase dashboard → update Infisical + redeploy API/workers |
| JWT secret | Supabase-managed; prefer short-lived access tokens + rotating refresh |
| OAuth client secrets | Provider console + Infisical |
| Connector credentials | Per-connector rotate; audit `connector_runs` |

## Access tokens

- Prefer short-lived access tokens + rotating refresh tokens (Supabase Auth default behavior).
- “Sign out everywhere”: revoke all sessions for `auth.uid()` via Auth admin API.
- Device list / sign-in history: surface `auth.sessions` (user_agent, ip) in account UI.

## Checklist after any rotation

- [ ] Secret manager updated
- [ ] All deployments restarted / env refreshed
- [ ] Old credential disabled then deleted
- [ ] Audit event recorded (forthcoming append-only trail)
