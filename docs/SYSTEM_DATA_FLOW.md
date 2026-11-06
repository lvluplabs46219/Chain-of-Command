# System Data Flow
**Status:** Proposed system contract; validate against implementation. **Version:** 1.0

## Purpose
Describe the intended path of data through Chain of Command (CoC), including boundaries where trust, authorization, or human review is required. This document is normative for new work; deployed behavior must be verified before claiming conformance.

## Logical flow
1. **User/client** submits a request, matter/case context, file, or action.
2. **Identity and authorization** resolve the authenticated actor, tenant, matter membership, role, and permitted capabilities. Reject requests with missing or ambiguous scope.
3. **Application/API layer** validates schema, size, content type, idempotency key, and business invariants.
4. **Persistence layer** stores canonical metadata and tenant-scoped records. Uploaded bytes reside in approved object storage; do not put sensitive document bodies in ordinary logs.
5. **Evidence intake** computes a cryptographic fingerprint over the received byte stream, records acquisition context, and creates provenance/custody events. The fingerprint proves byte-level identity only.
6. **Verification services** perform distinct checks: integrity, source, signature/seal, currentness, custody, and legal/contextual review. Each check returns a typed result, method, timestamp, evidence, and limitations.
7. **Agent orchestration** selects an authorized in-app or out-of-app worker, assigns a scoped task, and records task lifecycle events. Agents receive least-privilege inputs.
8. **AI/research layer** retrieves source material, preserves citations and source versions, produces analysis with uncertainty and provenance, and never silently converts suggestions into legal conclusions.
9. **Human review/approval** gates consequential legal, filing, external communication, destructive, or permission-changing actions.
10. **Audit ledger** records actor, action, target, timestamp, outcome, correlation/task ID, and integrity linkage. Corrections are new events; historical events are not silently rewritten.
11. **UI/reporting** presents status, evidence links, verification dimensions, unresolved warnings, and provenance. It must not imply a verification result that the underlying service did not return.
12. **Monitoring/operations** captures health, errors, metrics, and security events with data minimization.

## Trust boundaries
- Browser/client ↔ API
- Tenant/matter ↔ tenant/matter
- Application ↔ database/object storage
- API ↔ external providers
- Orchestrator ↔ agent worker / local daemon
- AI model ↔ tools and retrieved untrusted content
- Internal audit store ↔ external anchoring service
- Automated recommendation ↔ human decision

## Required controls
Authentication, server-side authorization, tenant isolation/RLS, schema validation, secure file handling, secret management, rate limits, audit events, idempotency, and explicit human-approval gates. Treat documents, web pages, emails, and model output as untrusted data—not instructions.

## Failure behavior
Fail closed for access control and approval checks. If a provider or verifier is unavailable, report **not verified / unavailable**, preserve evidence and retry metadata, and never label a skipped check as passed. Avoid duplicate side effects using idempotency keys.

## Implementation mapping
For each deployed flow, maintain a mapping to routes, services, tables, storage buckets, and tests. Mark unimplemented or unknown segments rather than assuming this proposed flow exists.
