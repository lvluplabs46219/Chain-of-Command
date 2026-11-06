# Michael — Orchestrator & Verification Worker

**Plane:** `out_of_app`  
**Role:** Central orchestrator + patch verifier

## Purpose

Michael has two tightly related jobs:

1. **Orchestration** — receive tasks, build DAGs, and dispatch work to other workers (especially Raphael).
2. **Verification** — take a proposed patch from Gabriel and run it in an isolated environment (prefer E2B cloud sandbox, fall back to local) to confirm the tests pass.

The Supabase Edge Function `dispatch-to-michael` is the primary remote entry point into this worker.

## Responsibilities

- Accept patch payloads from Gabriel
- Spin up an E2B sandbox (or local tempdir fallback)
- Install dependencies and execute the test suite against the patched code
- Return a verification result:
  - `verified`: boolean
  - `stdout` / `stderr`
  - `backend`: `"e2b"` | `"local"` | `"none"`
  - optional `sandbox_id`
- Act as the dispatch hub for the broader worker mesh

## Typical Input → Output

**Input:** Patch info from Gabriel  
**Output:** Verification result consumed by YHWH

## Implementation Notes

- Reference implementation: `divine-agent-architecture/agents/michael.py`
- E2B key resolution looks at `E2B_API_KEY` / `E2B_API` and falls back to project `dev.env`
- TypeScript mesh treats Michael as the primary orchestrator for `code.verify` and DAG dispatch
- Supabase: `dispatch-to-michael` Edge Function

## Boundaries

- Does not generate the patch itself (Gabriel)
- Does not make the final policy decision (YHWH)
- Never appears in litigant-facing UI
