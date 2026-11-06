# API Contracts and Versioning
**Status:** Contract authoring standard; routes must be inventoried against code.

## Contract requirements
Every API endpoint must document method/path, version, purpose, auth requirement, tenant/matter scope, request/response schema, error model, side effects, idempotency, rate limits, audit events, data classification, and examples. OpenAPI is preferred as the machine-readable source of truth.

## Conventions
- Use explicit schema validation at runtime; TypeScript types alone do not validate untrusted requests.
- APIs return stable machine-readable error codes and safe messages.
- Use UTC ISO-8601 timestamps and stable IDs.
- Pagination must be bounded; filters and sorts must be allowlisted.
- Mutating operations require authorization and an audit record.
- Side-effecting calls support idempotency where retries could duplicate work.
- Avoid returning secrets, internal stack traces, or unrestricted records.
- Distinguish `not_verified`, `unknown`, `unavailable`, and `failed` from `verified`.

## Versioning
Version public contracts explicitly (e.g. URL prefix or media type). Compatible additions may be minor; breaking changes require a new major version and migration/deprecation plan. Keep API and event schemas versioned separately. Reject unsupported major versions.

## Error envelope
Recommended fields: `code`, `message` (safe), `request_id`, optional `details` (non-sensitive, schema constrained), and `retryable`. Common classes: validation, unauthenticated, forbidden, not found, conflict, rate limited, dependency unavailable, internal error.

## Required endpoint inventory
Maintain a route inventory covering auth/session, matters/cases, documents/evidence, verification, source/library search, agent dispatch/status/results, approvals, audit events, exports, admin, and health. For each route identify implementation owner and tests. Do not infer that a route exists from this list.

## Security review
Review authorization scope, input bounds, object-level permissions, injection, data leakage, CORS/CSRF, rate limiting, and audit coverage. Require negative tests for unauthorized and cross-tenant access.

## Contract testing
Generate/validate OpenAPI, schema compatibility checks, request/response fixtures, consumer-provider tests, and CI verification. Keep examples synthetic and non-sensitive.
