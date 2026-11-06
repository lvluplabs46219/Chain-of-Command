# Seraphim — Diagnostic Worker

**Plane:** `out_of_app`  
**Role:** Diagnostic scanner & external inference pool

## Purpose

Seraphim is the first stage of the automated repair loop. It examines the environment, runs the test suite, and produces a structured diagnostic matrix that downstream workers (especially Gabriel) consume.

It does **not** write product code or talk to litigants.

## Responsibilities

- Run pytest (or equivalent) against the relevant test suite
- Capture stdout/stderr and extract failed tests
- Produce a diagnostic matrix with:
  - `status`: `HEALTHY` | `FAILURES_DETECTED`
  - `failed_tests`: list of failing test identifiers
  - `error_summary` / logs
  - `returncode`
- Act as an external inference / cloud pool when needed

## Typical Input → Output

**Input:** Project root / test directory  
**Output:** Diagnostic matrix dict used by Gabriel

## Implementation Notes

- Primary reference implementation: `divine-agent-architecture/agents/seraphim.py`
- Also referenced in the TypeScript multi-agent mesh under task kinds such as `code.diagnose`

## Boundaries

- No patch generation
- No policy decisions
- No direct commits
- Never exposed in Chambers or Directory
