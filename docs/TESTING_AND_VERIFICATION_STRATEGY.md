# Testing and Verification Strategy
**Status:** Baseline quality standard.

## Quality gates
A change is not complete until acceptance criteria are met, tests are run, results are recorded, and material limitations are disclosed. CI should block merge/deploy on required failures.

## Test layers
- Unit: pure logic, schema validators, permission rules, hashing/canonicalization.
- Component: UI states, forms, loading/error/empty states, accessibility basics.
- Integration: API, database, storage, auth, provider adapters, event persistence.
- Contract: API and agent envelope schemas, compatibility, fixtures.
- End-to-end: key user journeys across browser/API/data.
- Security: authz/RLS negative cases, tenant boundaries, injection, upload abuse, secrets, rate limits.
- Reliability: timeouts, retries, idempotency, provider outage, restart/recovery.
- Data integrity: fingerprint consistency, audit-chain checks, provenance links.
- Performance: bounded pagination, upload and query limits, target latency/load.
- Legal-domain evaluation: source relevance, citation correctness, currentness, disclaimer and approval behavior; human expert evaluation is mandatory for consequential workflows.

## Critical journeys
Sign-in/session revocation; tenant/matter isolation; create and access matter; upload and fingerprint evidence; derive and link artifact; verify source/signature/currentness with honest status; dispatch agent and collect structured result; request/record human approval; audit trace and export; backup restore; failure-safe fallback.

## Test data
Use synthetic or sanitized data. Do not use real client/court matter content in shared CI unless explicitly approved and protected. Fixtures must be versioned and deterministic.

## Required reporting
For each run: commit/ref, environment, test suite/version, date, result, failures, logs/artifact links, coverage where meaningful, and unresolved risks. A green test does not establish legal admissibility or production security.

## Release acceptance
No unresolved critical/high security defects without documented risk acceptance; migrations reviewed and tested; rollback/restore path tested; API contract compatible; observability configured; approval gates validated; release notes prepared.

## Flaky tests
Track owner and issue; do not silently skip or weaken tests. Quarantined tests have a reason and expiration/review date.
