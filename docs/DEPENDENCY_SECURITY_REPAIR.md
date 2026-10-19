# High-severity dependency repair

Tracker: `COC-291`, continued on `fix/build-ci-reliability` at the user's request. Parent commit: `ab91a803461a837428efa5f459ab87eac9e50092`.

## Requirements to implement

Resolve the 19 high-severity affected-package entries without removing supported SDKs, accepting npm's major-version downgrades, weakening the audit gate, changing live databases, or merging/deploying. Trace findings to their vulnerable transitive packages and verify both security behavior and application compatibility.

## Implementation plan

- **Firebase path:** Override `@firebase/firestore`'s gRPC dependency with patched `@grpc/grpc-js` 1.14.6, remaining within major 1.
- **Workflow serialization:** Override `@workflow/core`'s devalue with patched 5.9.4, retaining its existing major-version serialization interface.
- **Workflow IDs:** Override `@workflow/core`'s nanoid with patched 5.1.16, retaining major 5.
- **Next.js CSS processing:** Override Next's PostCSS with 8.5.31, retaining major 8 and leaving Next.js on 15.5.28.
- **Verification:** Regenerate the lockfile using the previously validated npm 11 resolver, perform a clean install, verify resolved dependency paths, add targeted tests, and rerun all existing checks and remote CI.
- **Residual risk:** Record any moderate toolchain findings separately; passing the high-severity gate is not a claim that all vulnerability findings are gone.

## File-level touch map

- **`package.json`:** Four scoped transitive overrides with exact reviewed target versions.
- **`package-lock.json`:** Deterministic dependency graph and integrity changes.
- **`apps/api/tests/dependency-security.test.ts`:** Installed-parent resolution, dependency security and compatibility checks.
- **`vitest.config.ts`:** Explicit inclusion of the new test suite.
- **Tracker and repair documentation:** Before/after evidence, reproduction commands, rationale, acceptance results, and remaining limits.

## Acceptance criteria

The locked graph and clean install contain no high or critical npm audit findings. Root/API/web/package type-checks, existing unit/security checks, new dependency regressions, both production builds, and remote dependency audit pass without changes to the high-severity CI threshold.

Keep the application SDK majors and existing functionality intact. Do not call the repository production-ready based solely on an audit gate or offline smoke checks.

| Locked dependency path | Before | After |
|---|---:|---:|
| `@firebase/firestore` → `@grpc/grpc-js` | 1.9.16 | 1.14.6 |
| `@workflow/core` → `devalue` | 5.9.2 | 5.9.4 |
| `@workflow/core` → `nanoid` | 5.1.6 | 5.1.16 |
| `next` → `postcss` | 8.4.31 | 8.5.31 |

Local verification passes: clean install, all type-checks, 58 unit tests including five new dependency regressions, source/compiled security smoke checks, and API/web production builds with web type validation enabled. `npm ls` validates the installed overrides, and the high-severity audit command exits zero.

The full and production-only audits now show zero high, zero critical, and four moderate affected-package entries, compared with 19 high and five moderate before. These counts describe affected packages, including inherited findings, not independent exploits. Firebase 12.19.0, Workflow 5.0.1, and Next.js 15.5.28 remain unchanged.

The four residual moderate entries share the Drizzle Kit → esbuild-kit → esbuild 0.18.20 chain. They are also present in the production-only graph because Drizzle Kit is declared as a web runtime dependency; do not dismiss them as development-only. They require separate review rather than an unsafe downgrade to npm's suggested Drizzle Kit 0.18.1.

## Test plan

Capture fresh full and production-only audits; inspect the resolved leaves from the SDKs that consume them. Test Workflow serializer round-trips and buffer isolation, Nano ID invalid-size handling in a bounded child process, Firebase/gRPC initialization and a loopback RPC, and Next's PostCSS parser/source-map behavior.

Run clean installation, all type-checks, the complete unit suite, source/compiled security smoke checks, API/web production builds, and remote QA. Save full before/after audit JSON and final check-run metadata in the Project.

The serializer regression tests pooled Node.js Buffer isolation and the Workflow serializer module; it does not claim to harden every arbitrary typed-array backing-store scenario. The gRPC test uses loopback insecure credentials to verify runtime compatibility, not a live Firebase service or a TLS client-certificate policy. The PostCSS no-base-path warning is expected in the malicious source-map regression.

The first incremental npm lock refresh retained old vulnerable leaves. A clean, manifest-only npm 11.21.1 resolution was therefore used; the resulting lock was independently installed with strict peer validation and no lifecycle scripts. Its code/version changes remain limited to the targeted dependency paths and their necessary hoisting/proto-loader adjustments.

## Risks and rollback

The selected versions patch transitive constraints that upstream parents currently pin to vulnerable releases. Keep overrides narrow: do not globally replace every Nano ID, esbuild, or gRPC version and do not use `npm audit fix --force`.

Firebase's old `~1.9.0` gRPC constraint is intentionally overridden with a later major-1 release, so validation must include its runtime API and actual parent resolution. The PostCSS override stays in major 8 but changes Next's exact internal pin; validate CSS processing and the production build.

Rollback by reverting this branch commit and restoring its parent lockfile, not by editing the deployed database. Once upstream releases remove the need for an override, remove it only with another clean audit and regression pass.

## User checklist

Review the final remote run and residual moderate findings before merging. Full SBOM, accessibility, production PostgreSQL/RLS integration, live Firebase/Workflow services, and container scanning remain separate acceptance items unless explicitly verified.

The patched boundaries are documented in [gRPC's advisory](https://github.com/advisories/GHSA-m9gg-hp2v-232j), [devalue's shared-memory advisory](https://github.com/advisories/GHSA-j22f-vq7h-c4qm), [Nano ID's negative-size advisory](https://github.com/advisories/GHSA-28wg-ghj8-5hjv), and [PostCSS's source-map advisory](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp).
