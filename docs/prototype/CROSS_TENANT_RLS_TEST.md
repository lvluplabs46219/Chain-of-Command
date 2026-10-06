# Cross-tenant RLS adversarial check (2026-10-05)

## Method

Supabase `execute_sql` runs as a privileged role (RLS bypassed). We therefore tested the **SECURITY DEFINER helpers** that all matter-scoped policies depend on, by simulating JWT `sub` via `set_config`:

```sql
SELECT set_config('request.jwt.claim.sub', '<auth_id>', true);
SELECT set_config('request.jwt.claims', '{"sub":"<auth_id>","role":"authenticated"}', true);
```

## Fixtures

| Actor | `users.id` | `auth_id` | Tenant |
|-------|------------|-----------|--------|
| Owner (prototype) | `eca94b54-…` | `d3ed7889-…` | `acquit-prototype` |
| Adversary | `22000000-…099` | `33000000-…099` | `adversary-tenant` |

Victim matter: `a1000000-0000-4000-8000-000000000001` (`CR2025-012345`).

## Results

| Check | Owner JWT | Adversary JWT |
|-------|-----------|---------------|
| `current_app_user_id()` | owner id | adversary id |
| `is_tenant_member(prototype)` | **true** | **false** |
| `is_tenant_member(adversary tenant)` | n/a | **true** |
| `can_access_matter(sample)` | **true** | **false** |

**Pass:** adversary cannot access the prototype matter via helper predicates used by RLS.

## Limitation

This does not exercise end-to-end PostgREST as `authenticated` with a real session cookie. For that, use the Supabase client with two real Auth users and assert `matters` / `research_queries` return 0 rows for the other tenant.

## Cleanup

Synthetic rows left for regression re-runs:
- user `adversary-test@example.invalid`
- tenant slug `adversary-tenant`
