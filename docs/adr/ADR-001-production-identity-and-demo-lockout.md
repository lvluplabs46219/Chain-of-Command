# ADR 001: Canonical Supabase Production Identity, Dual-Auth Retirement & Demo Lockout Policy

## Status
Accepted

## Date
2026-10-06

## Context
Chain of Command previously contained overlapping authentication paths:
1. Client-side Firebase Auth and Firestore references alongside Supabase Auth.
2. In-memory and mock demo tokens (`demo-token`, `mock-token`, `dev-token`) accepted by API middleware.
3. Fallback to `"demo"` model provider on AI agent execution routes (`ai.ts` and `model-gateway.ts`).
4. Fail-open CI steps in `.github/workflows/ci.yml` that warned and exited `0` rather than halting on regression.

This created a dual-auth gap and the risk of unauthenticated bypass or unintended demo provider execution in production deployments.

## Decision

### 1. Canonical Supabase Identity
- **Single Source of Truth**: Supabase is the sole production identity provider for API authorization and workspace access control.
- **Session Flow**: The client acquires a JWT session via `@supabase/supabase-js` (`getSupabaseClient()`), passes it in HTTP `Authorization: Bearer <access_token>` headers, and the API gateway validates it using `verifySession` (`supabase.auth.getUser(token)`).
- **Dual-Auth Removal**: Firebase Auth and Firestore client initialization paths have been decommissioned from active production code paths. Firebase client stubs are inert and do not listen to background connection state or provide alternative sign-in.

### 2. Demo Lockout in Production
- **Middleware Lockout (`verifySession.ts`)**: When `NODE_ENV === 'production'`, development and mock tokens (`demo-token*`, `mock-token*`, `dev-token*`, `chain-of-command-pro-se-token`) are strictly forbidden. All requests must carry a verifiable Supabase JWT; any unverified or mock token yields `HTTP 401 UNAUTHORIZED`.
- **Model Gateway & Route Lockout (`ai.ts`, `model-gateway.ts`)**:
  - In production, requests explicitly specifying `provider: "demo"` are rejected with `HTTP 400 Bad Request` ("Demo model provider is disabled in production.").
  - When the model provider is omitted in production, it resolves to the configured environment provider (`process.env.AI_PROVIDER`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, or Ollama), never falling back to `"demo"`.

### 3. Fail-Closed CI Pipeline & Automated Security Test Gate
- `.github/workflows/ci.yml` is updated to be fail-closed: typecheck and build errors immediately fail the pipeline.
- `apps/api/tests/security.test.ts` is executed under CI (`npm run test --workspace=apps/api`), providing an automated green/red signal verifying authentication enforcement, webhook HMAC validation, CORS, CSP, and production demo lockout.

## Consequences
- **Security**: Closed authentication bypass vectors; unauthorized requests cannot invoke AI agents or private directory endpoints.
- **Reliability**: Eliminates runtime confusion between Firebase and Supabase sessions.
- **Maintainability**: Clear architectural separation between local development convenience and production enforcement.
