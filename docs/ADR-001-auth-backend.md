# ADR-001 — Auth backend: Supabase is authoritative

**Status:** Accepted  
**Date:** 2026-10-05  
**Branch:** feature/v2-phase0-foundation

## Context

The web app mixed Firebase Auth (Google popup + ID tokens), Supabase Auth (session JWTs), and local demo tokens (`acquit-pro-se-token`). The API `verifySession` middleware only validates Supabase JWTs (plus demo tokens in non-production). Firebase ID tokens are rejected by the API.

## Decision

1. **Supabase Auth is the only production identity provider** for API authorization.
2. Demo / `coc-session-*` / `acquit-pro-se-token` tokens are **forbidden when `NODE_ENV=production`** (and when `ALLOW_DEMO_AUTH=false`).
3. Firebase Google sign-in may remain as a **UI experiment** until removed, but its ID tokens **must not** be treated as API credentials. Migrate Google SSO to Supabase Auth providers.
4. Client must not auto-mint a session on first load.

## Consequences

- Workspace modules require an explicit login (Supabase session or opt-in demo in development).
- Production misconfiguration fails closed (401/503) instead of a shared pro-se identity.
- Follow-up: wire Supabase email/OAuth UI; delete Firebase path once parity exists.
