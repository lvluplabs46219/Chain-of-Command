# Database migrations (Chain of Command)

These SQL files mirror migrations applied to the **Acquit.ai** Supabase project (`othxichdhzdxgtatautb`).

## Applied sequence (2026-10-05)

| File | Purpose |
|------|---------|
| `20261005_01_coc_missing_tenancy_and_lookups.sql` | tenants, memberships, jurisdictions, courts |
| `20261005_02_coc_missing_case_domain.sql` | statutes, charge_elements, defenses, tasks, case_members |
| (live) `coc_missing_documents_drafts_legal` | document_* , drafts, authority_*, citations |
| (live) `coc_missing_agents_research_court_ops` | agent_*, research_*, connectors, attorneys, ops |
| `20261005_03_coc_tenant_id_and_rls_helpers.sql` | `matters.tenant_id`, `cases.tenant_id`, RLS helpers |
| `20261005_04_coc_rls_policies.sql` | Core RLS policy mirror |

## Helpers

- `current_app_user_id()` — maps `auth.uid()` → `users.id` via `users.auth_id`
- `is_tenant_member(tenant_id)` — active membership check
- `can_access_matter(matter_id)` — owner, case_member, or tenant member

## Notes

- `service_role` bypasses RLS (Supabase default).
- Prototype seed matter `CR2025-012345` is linked to tenant `acquit-prototype`.
- Full policy count on public schema after apply: ~190.
