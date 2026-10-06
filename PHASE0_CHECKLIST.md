# Phase 0 — Fix-first checklist

## Done on this branch (2026-10-05)

- [x] ADR-001: Supabase is API auth authority
- [x] API rejects demo tokens in production
- [x] Web does not auto-provision `acquit-pro-se-token`
- [x] `loginAsLitigant` gated to non-production
- [x] CI: fail on critical audit, TruffleHog, typecheck, build
- [x] TypeScript `~5.9.3`
- [x] `supabase/migrations/` restored from `1cd65ff`
- [x] PR template with Definition of Done

## Still open

- [ ] Remove or fully quarantine Firebase Google as API-usable identity (Supabase OAuth parity)
- [ ] `supabase link` + `migration list` vs production; SCHEMA_RECONCILIATION.md
- [ ] Archive dead trees (`c-o-c`, `chain of command`, `divine-agent-architecture`)
- [ ] Move master prompt under `docs/`; remove nested `Aquit-Platform/` after extraction
- [ ] Default LLM provider from env (not silent `demo`)
- [ ] Domain code must not construct `GoogleGenAI` directly — gateway only
- [ ] Expand `security.test.ts`; restore `scripts/ts/test_compliance_and_security.ts` or drop npm script

## 2026-10-05 main merge progress
- [x] Merged feature/v2-phase0-foundation into main
- [x] AuthContext Supabase-only (no Firebase Auth)
- [x] Dead trees moved under archive/legacy-prototypes
- [x] Root firebase configs -> archive/legacy-firebase
- [x] LLM default: env LLM_DEFAULT_PROVIDER or ollama in production / demo in dev
- [~] workspace-sync still uses Firestore client (legacy)
- [~] package-lock.json generation may still be in progress
