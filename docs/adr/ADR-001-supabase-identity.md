# ADR-001 — Supabase is the only production identity provider

**Status:** Accepted (2026-10-05)  
**Deciders:** CEO confirmation

## Decision

- **Supabase Auth** issues the only tokens the API may accept (`verifySession`).
- **Firebase Auth / Firestore** are not production identity or case-data planes.
- **Demo** model provider and demo auth tokens are **development-only**; disabled when `NODE_ENV=production`.

## Consequences

- Web: `AuthContext` uses Supabase session; `workspace-sync` is localStorage-only until matter API is authoritative.
- `apps/web/src/lib/firebase.ts` is a fail-closed stub; config JSON is redacted.
- API: `resolveModelProvider` refuses `demo` in production; default is `LLM_DEFAULT_PROVIDER` or `ollama`.

## Follow-ups

- Remove `firebase` / `firebase-admin` dependencies from `apps/web/package.json` when no remaining imports.
- Point matter load/save at Supabase REST after RLS policies are exercised with real Auth users.
