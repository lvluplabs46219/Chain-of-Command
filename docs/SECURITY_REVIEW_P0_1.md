# Security Review Note — P0-1 Tenancy / Identity / RLS

**Date:** 2026-11-03  
**Project:** `othxichdhzdxgtatautb` (Acquit / Chain-of-Command)  
**Migration:** `p0_1_tenancy_identity_rls_hardening`

## Summary

Deny-by-default multi-tenant foundation is in place. Client-supplied role/tenant/case claims are never trusted for authorization. All authorization context is resolved server-side from `auth.uid()` → `public.users` → `memberships` / `case_members`.

## Model

| Layer | Mechanism |
|-------|-----------|
| Identity | Supabase Auth (`auth.users`) + `public.users` (`auth_id`) + `public.profiles` |
| Tenancy | `tenants` + `memberships` (`org_role`: owner/admin/staff/member/viewer) |
| Case RBAC | `case_members` (`role`: owner/collaborator/viewer) |
| ABAC helpers | `is_tenant_member`, `has_tenant_role`, `can_access_matter`, `has_case_role`, `mfa_aal_is_aal2` |
| Service layer | `@chain-of-command/auth` `authorize()` — MFA freshness for external actions |
| RLS | Enabled on all tenant- and case-scoped tables; policies call helpers only |

## Deny-by-default behavior confirmed

1. **Cross-tenant isolation:** `tenants` SELECT requires `is_tenant_member(id)`. Matters/cases SELECT requires ownership, case membership, or tenant membership.
2. **Case roles:** Viewers cannot mutate `case_members`. Only case owner or tenant admin+ can insert/update/delete memberships.
3. **Admin surfaces:** Tenant settings and service accounts require `has_tenant_role(..., 'admin')`.
4. **Ingestion paths:** `ingestion_watermarks` has explicit deny-all for `authenticated`/`anon` (service_role only).
5. **No long-lived client API keys:** Service accounts are tenant-scoped, admin-managed, audited via table metadata (`key_id`, `scopes`, `last_used_at`). Rotation procedure: docs/KEY_ROTATION.md.

## Intentionally remaining advisor notes

- **SECURITY DEFINER helpers executable by `authenticated`:** Required so RLS policies can evaluate helpers under the caller’s role. Direct RPC use returns only boolean/uuid scoped to the caller; no cross-tenant data leakage. EXECUTE is revoked from `PUBLIC`/`anon`.
- **Leaked password protection:** Enable in Supabase Auth dashboard (HaveIBeenPwned). Dashboard setting; not migratable via SQL.

## MFA / Sessions

- Supabase Auth supports TOTP + WebAuthn (`auth.mfa_factors`, `auth.webauthn_*`).
- Service layer requires fresh MFA (`mfaVerifiedAt` ≤ 5 minutes) for `external_action`.
- `mfa_aal_is_aal2()` reads JWT `aal` claim for policy/service gates.
- Session revocation / sign-out-everywhere: Supabase Auth admin APIs + `auth.sessions` / refresh token revoke (app wiring in packages/auth and apps).

## CI expectations

- Isolation suite under `packages/auth/src/__tests__/isolation.test.ts` must fail the build if cross-tenant access becomes possible.
- Migration applied to staging/production via controlled pipeline only.

## Out of scope (later tasks)

- Full append-only audit hash-chaining (Task 2)
- Case creation UI / jurisdiction UX (Task 4)
- Agent runtime / model gateway (Task 7)
