# Chain-persistence type repair

Tracker: `COC-291`, continued at the user's request on `fix/build-ci-reliability`. Parent repair commit: `ee79889e6e576525fa46b8fadbccf7d75c2a4829`. This records the chain-repair milestone; its then-outstanding high dependency findings were subsequently resolved in `docs/DEPENDENCY_SECURITY_REPAIR.md`.

## Requirements to implement

Resolve the 17 API diagnostics without compiler suppressions, weaker checks, dependency upgrades, or deployed database changes. Preserve the existing hash/signature serialization and synchronous in-memory API while giving the database service an honest asynchronous contract.

## Implementation plan

- **Composition:** Reuse the in-memory signer/verifier against explicit persisted snapshots instead of overriding synchronous methods with promises.
- **Continuation:** Seed append sequence/hash state from the last committed event, using a transaction and per-chain advisory lock; generate database-compatible event UUIDs.
- **SQL:** Combine chain/context/date predicates with Drizzle operators in one `where` clause.
- **Metadata:** Type database rows and optional ISO string metadata explicitly; restore missing optional context as `undefined` for canonical compatibility.
- **Verification:** Verify the full selected persisted snapshot, preserve its chain ID, and reject invalid or missing signatures.
- **Regression coverage:** Exercise SQL construction, restart continuation, rollback, chain isolation, metadata, tampering, signatures, and existing synchronous readers without contacting production databases.
- **Remote verification:** Push only the existing repair branch and inspect the new commit's GitHub check-runs until completion.

## File-level touch map

- **`apps/api/src/lib/chain-of-command-server.ts`:** Asynchronous persistence service, typed mapping, transactional appends, SQL predicates, metadata and tracking.
- **`apps/web/src/lib/chain-of-command.ts`:** Optional persisted metadata/snapshot input, database-compatible IDs, preserved synchronous readers, signature enforcement.
- **`apps/api/tests/chain-persistence.test.ts`:** Offline database-boundary regression tests.
- **`vitest.config.ts`:** Explicit inclusion of the new API regression suite.
- **Tracker and repair documents:** Record results and remaining gates without declaring the full `COC-291` scope complete.

## Acceptance criteria

All root/API/web/package type-checks pass; existing tests and new chain regressions pass; API/web production builds and compiled security smoke checks remain passing. Remote API type-check must change from failure to success, and other build/test checks must stay green.

Local results: all root/package/web/API type-checks pass, 53 tests pass across four files (including 30 new chain regressions), both API smoke scripts pass, the compiled security script passes, and both production builds pass with web type validation enabled. Workflow validation also passes.

The locked dependency audit still reports 19 high and 5 moderate findings, with no critical findings. Neither manifests nor the lockfile changed in this pass. That gate remains a blocker and is not resolved by these type repairs.

## Test plan

Run targeted regressions first, then full type-checks, all unit/security tests, compiled security smoke checks, production builds, workflow validation, and remote CI. Database-boundary tests use scripted offline rows and real Drizzle SQL construction, not a fallback production database.

```sh
npm exec --no -- vitest run apps/api/tests/chain-persistence.test.ts
npm run typecheck
npm run test
npm run test:security:bundle
npm run build
npm audit --audit-level=high
```

The golden-hash fixture was captured from the parent implementation and passes unchanged. Failed insert and metadata-write tests assert a rollback request; retry tests confirm that an uncommitted attempt does not advance signer sequence/hash state. These are offline database-boundary checks, not evidence that production rollback, advisory locking, or RLS has been integration-tested.

## Risks and rollback

Changing canonical serialization would invalidate history, so leave its format unchanged. Database concurrency behavior requires a real PostgreSQL transaction/advisory lock; offline tests can check the boundary and atomic flow but cannot certify production RLS, connection-pool sizing, or deployed schema readiness.

Keep `main` and live databases unchanged. Revert the branch commit if regression or review exposes a persistence issue; no live database rollback should be needed.

## User checklist

Review the new CI run and the remaining dependency gate before merging. Follow up separately on production-schema reconciliation, authorization/RLS integration tests, and dependency remediation; none is implied complete by a clean type-check.
