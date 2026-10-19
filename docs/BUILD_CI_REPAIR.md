# Focused build and CI repair

Branch: `fix/build-ci-reliability`. Base: `8d2b43ee29ce0e001bc221677c3356ef6a35c0a8`. Tracker: `COC-291`, still in progress. This document records the initial repair checkpoint at `ee79889`; later work fixed the API errors and high dependency findings. Read `docs/CHAIN_PERSISTENCE_REPAIR.md` and `docs/DEPENDENCY_SECURITY_REPAIR.md` for the follow-ups; the acceptance table below is historical, not the current vulnerability or test status.

## Requirements to implement

- **Reproducibility:** Use Node 22.12 or newer within major 22, a committed npm lockfile, strict engine checks, and normal peer validation rather than the old blanket peer-dependency bypass.
- **Real build checks:** Build both API and web; make production Next.js compilation validate types.
- **Executable tests:** Restore the existing 23 unit tests and both API smoke scripts without weakening authorization or HMAC assertions.
- **Truthful CI:** Separate independent checks, fail failed builds/scans, and stop labeling absent Playwright coverage or secret injection as successful tests/builds.
- **Scope boundary:** No duplicate purge, legacy-directory deletion, applied migration, Supabase policy/index/function change, or deployment.

## Implementation plan

- **Completed:** Created root scripts, a shared TypeScript base, package checking, Vitest configuration, Node runtime guidance, and a clean npm lockfile.
- **Completed:** Fixed API workspace imports and declared upload/runtime dependencies; corrected its start path; replaced the incompatible Pino bundling plugin with installed runtime externals.
- **Completed:** Restored the existing chain-schema exports after the monorepo move without creating or applying a schema. This exposes further service-contract errors rather than inventing a new database model.
- **Completed:** Fixed web contract errors, Zod record signatures, a repeated test fixture property, missing SDK schema exports, and the approval type already specified in master specification §9.5.
- **Completed:** Aligned task dispatch and stream-event objects with their declared contracts, validated the model-provider union, and clarified single-segment authenticated route parameter types.
- **Completed:** Made security tests deterministic using a loopback-only rejecting Auth stub and a nonconnecting placeholder database URL, with explicit cleanup of the orchestrator timer.
- **Completed:** Removed inline script/style allowances from the API's CSP; kept production demo-lockout and webhook signature assertions.
- **Pending:** Repair the chain service's async overrides of synchronous base methods and its timestamp/optional event contracts in a separately reviewed security-sensitive change.
- **Pending:** Remediate or formally review existing high dependency findings; do not force major upgrades or lower the new audit gate to obtain a green run.

## File-level touch map

| Area | Files and intent |
|---|---|
| Root setup | `.nvmrc`, `.npmrc`, `package.json`, `package-lock.json`, `tsconfig.base.json`, `vitest.config.ts`: reproducible setup and executable checks |
| API | `apps/api/package.json`, `build.mjs`, `tsconfig.json`, auth/audit imports, typed route/event/dispatch contracts, security test setup, CSP |
| Web | `next.config.mjs`, session bootstrap promise handling, navigation tab contract, dashboard callback type, research result/citation contract |
| Packages | `packages/tsconfig.json`, ESM metadata for auth/audit/shared, declared approval/JSON-schema types, restored chain-schema exports, Zod signature and audit test fixture |
| CI | QA matrix, actual production build, strict container scan, manual/config-required Playwright, valid local failure summary, JavaScript CodeQL without a misleading autobuild |
| Container | Node 22 base, lockfile install, actual API output path, `.dockerignore` for local artifacts and secrets |
| Progress | `docs/Chain_of_Command_Todo_Tracker.csv` and this record; task is not marked complete |

The research result fallback no longer claims that synthetic citations are verified or assigns them a fabricated positive confidence score. This is a conservative data-contract correction, not legal-source validation.

## Initial acceptance checkpoint at ee79889

| Criterion | Local result |
|---|---|
| Clean `npm ci --ignore-scripts --no-audit --no-fund` | Pass; 1,015 packages installed from the generated lockfile |
| `npm run typecheck:packages` | Pass |
| `npm run typecheck:web` | Pass |
| `npm run typecheck:api` | Blocked; 17 diagnostics confined to `apps/api/src/lib/chain-of-command-server.ts` |
| `npm run test:unit` | Pass; 3 files, 23 tests |
| `npm run test:security` | Pass; provider lockout plus public health, auth rejection, HMAC, CORS, CSP, and production demo checks |
| `npm run test:security:bundle` | Build and compiled security script passed locally; script added as a CI matrix target |
| API production bundle | Pass; Pino resolves from installed runtime packages |
| Production API entry point | Pass; started the built `dist/src/index.mjs`, verified `/api/health` returned 200, and stopped it gracefully |
| Web production build with type validation | Pass with placeholder local Supabase settings |
| Workflow YAML and actionlint | Pass locally |
| Dependency audit | Blocked; 19 high, 5 moderate, 0 critical affected-package entries in the locked snapshot |
| Docker image / Trivy | Not run locally; Docker is unavailable in this sandbox |
| CodeQL / TruffleHog / GitHub-hosted jobs | Not claimed from local results; verify the remote branch run separately |
| Authenticated production flows / real DB persistence | Not tested; no production credentials or database writes were used |

An expected red API or dependency job is not a successful acceptance result. The independent matrix is deliberate: it shows the checks that actually passed without letting one blocker prevent every other check from running.

## Test plan

Run the following from the repository root using Node 22:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run typecheck:packages
npm run typecheck:web
npm run typecheck:api
npm run test
npm run test:security:bundle
npm run build
npm audit --audit-level=high
```

The public web build can use `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` and explicit placeholder public keys; it does not establish authenticated runtime correctness. The smoke script overrides Auth/database configuration with local test values and never queries a real database.

The lockfile was generated from clean workspace manifests using npm 11.21.1 after npm 10's resolver crashed while constructing this peer graph. Installation from that lock was then independently verified with npm 10.8.2. If refreshing the lockfile, use npm 11.21.1 rather than reinstating `legacy-peer-deps` or editing the lockfile by hand.

Keep workflow validation separate from execution: actionlint validates workflow expressions and structure, not whether an image exists, a container builds, or a GitHub security service is enabled. Playwright remains manual and fails clearly if no real configuration exists; no end-to-end coverage is claimed.

## Risks and rollback

- **Chain persistence:** The service overrides synchronous base readers with asynchronous database methods, and date/optional-field contracts disagree. Suppressing errors or casually changing the cryptographic event model could break integrity. Preserve the failing type-check and add persistence/integrity regression tests before that follow-up.
- **Dependency graph:** Pinning the graph makes existing advisories reproducible, not resolved. The initial Vitest 3 setup was replaced with patched Vitest 4.1.11 plus Vite 7.3.7 before the final lockfile; no critical findings remain in the final audit snapshot.
- **Strict runtime:** Node 20 installs now fail intentionally. Use the runtime selected by `.nvmrc`; do not disable engine checks.
- **Pino packaging:** Runtime logger packages must remain installed beside the API bundle. Both source and built smoke scripts pass, but a separately distributed bundle without dependencies needs its own packaging contract.
- **Header hardening:** The API no longer permits inline script/style CSP sources. Public JSON/security smoke checks pass; authenticated embedded UI flows were not browser-tested.
- **Rollback:** Leave `main` untouched and abandon or revert the repair branch if necessary. No database rollback is required because no database changes were applied.

## User checklist

- **Review scope:** Keep this branch separate from duplicate/legacy cleanup.
- **Confirm protection rules:** Decide which named matrix checks and scanners are required for merging; no branch-protection settings were changed.
- **Resolve blockers:** Review chain-persistence semantics and dependency advisories before expecting a green overall run.
- **E2E ownership:** Add a real Playwright configuration, fixtures, runner dependency, and tests before enabling automatic E2E coverage.
- **Remaining tracker scope:** SBOM, accessibility, migration checks, and full integration coverage from `COC-291` are not delivered merely by this initial repair.
- **Release boundary:** Do not deploy or merge based on passing bundle compilation alone.
