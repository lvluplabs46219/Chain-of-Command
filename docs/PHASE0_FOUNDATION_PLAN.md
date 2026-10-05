# Phase 0 — Foundation & Guardrails (v2.0 alignment)

## PLAN

1. **Context / existing architecture**
   - Existing monorepo `lvluplabs46219/Chain-of-Command` (also branded Acquit.ai).
   - Partial schema in `packages/db` (matters, parties, documents, chunks) without multi-tenancy, RLS, or hash-chained audit.
   - Packages present: `db`, `database`, `rag-engine`, `connectors`, `security`, `workflow`.
   - Gaps vs Master Prompt §6.2 / §30 Phase 0: no `shared` result envelope, no formal error taxonomy, no agent-sdk manifests, no append-only audit hash chain, incomplete tenancy.

2. **Files affected**
   - Created: `packages/shared/**`, `packages/audit/**`, `packages/agent-sdk/**`
   - Created: `docs/capability-register/CAPABILITY_NOT_VERIFIED.md`, `docs/PHASE0_FOUNDATION_PLAN.md`
   - Next: schema expansion in `packages/db` (tenants, memberships, audit_events, RLS), model-gateway skeleton, auth package.

3. **Dependencies required**
   - TypeScript workspaces already in root `package.json`.
   - Node crypto for hash chain (built-in).
   - Provider model IDs: **must re-verify** against current Gemini / alternate provider docs (Capability Register #2).

4. **Database changes**
   - Planned (not yet applied): `tenants`, `memberships`, `audit_events` (append-only + hash chain), session GUC for RLS (`app.tenant_id`).
   - Migrations must be additive-first and reversible.

5. **API changes**
   - Error responses must use `PlatformError.toApiBody()` shape.
   - Structured tasks return `TaskResult<T>` envelope.

6. **Security implications**
   - Guardrails immutable in agent manifests.
   - External actions always require `HumanApproval`.
   - Cross-tenant access must be structurally impossible (RLS + service-layer authz).

7. **Testing requirements**
   - Unit: hash-chain verify, manifest validation (escalation rejected, guardrails immutable).
   - Adversarial: cross-tenant read attempt → 0 rows; external action without approval → `APPROVAL_REQUIRED`.

## Status

- [x] Shared error taxonomy + PlatformError
- [x] CitationObject + TaskResult envelope
- [x] AuditEvent + hash-chain helpers
- [x] AgentManifest + validateAgentManifest
- [x] ToolDescriptor + external-action contract assert
- [x] Capability-Not-Verified Register seeded
- [ ] Tenancy tables + RLS policies
- [ ] MFA / OIDC session plumbing
- [ ] CI gates for typecheck + adversarial suite
