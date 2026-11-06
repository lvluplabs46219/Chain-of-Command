# Chain of Command — Master System Specification
**Status:** Consolidated governing draft. Reconcile with implementation before marking requirements shipped.
**Purpose:** Single entry point to product goals, architecture, data, verification, agents, security, operations, and acceptance criteria.

## Product mission
Chain of Command (CoC) is a traceable workflow and verification platform for evidence, documents, sources, people, legal/court actions, filings, research, AI actions, permissions, and decisions. It should make status, provenance, accountability, and uncertainty inspectable rather than relying on opaque assertions.

## Product principles
1. Traceable by design: meaningful actions link to actors, objects, sources, tasks, and timestamps.
2. Integrity ≠ authenticity ≠ truth ≠ admissibility; represent these independently.
3. Human accountability: consequential legal/external/irreversible actions are approval-gated.
4. Least privilege and tenant/matter isolation.
5. Transparent verification: every result has method, evidence, as-of time, and limitations.
6. Preserve originals; derivatives and corrections are linked and auditable.
7. Agent autonomy is bounded by declared capabilities and policy.
8. Resilience without false assurances: outage means unknown/unavailable, not pass.
9. Interoperable versioned contracts and exportable records.
10. Privacy, retention, and legal holds govern data lifecycle.

## System architecture
Logical layers: client/UI; identity/authorization; application/API; domain services; evidence/document storage; audit/provenance ledger; verification engine; source/library/research; agent orchestrator and worker planes; human approval; telemetry/operations; optional external anchoring. See `CHAIN_OF_COMMAND_ARCHITECTURE.md`, `AGENT_PLANES.md`, and `SYSTEM_DATA_FLOW.md`.

## Workforce model
Two distinct execution groups:
- **In-app agents:** application-native personas and service logic that operate within app boundaries.
- **Out-of-app workers:** separate processes/daemons or tool-connected workers dispatched by the orchestration layer.
Both need stable IDs, versioned task contracts, capabilities, scoped permissions, lifecycle states, and auditable outcomes. Refer to `DEFINED_TERMS.md` and `AGENT_COMMUNICATION_PROTOCOL.md`.

## Domain objects
At minimum consider tenant, user/actor, matter/case, resource/document/evidence, source, fingerprint, verification record, custody event, audit event, agent, capability, task, approval, export, legal hold, and incident. Exact schemas are governed by `DATA_MODEL.md` and API contracts. Avoid assuming a model is implemented until verified.

## Core workflows
### Evidence
Ingest → classify → fingerprint → record provenance/custody → preserve original → verify independent dimensions → review → export/share with authorization → archive/dispose per hold and retention.

### Research
Question/scope → retrieve primary and secondary sources → capture metadata and version → validate citation and currentness → synthesize with uncertainty/contrary authority → human review for consequential use.

### Agent work
Authorize request → compose scoped task envelope → dispatch permitted worker → receive progress/result/error → validate schema and evidence → approval gate for action → record audit/provenance.

### Legal verification
Run independent checks for integrity, source, signature/seal, currentness, custody, context/authority, and human legal review. Report each dimension and limits.

## Security and privacy
Threats, controls, and validation are governed by `SECURITY_THREAT_MODEL.md`, `AI_AGENT_PERMISSION_MATRIX.md`, and `DATA_LIFECYCLE_AND_PRIVACY.md`. Required controls include server-side authz, tenant isolation, secret protection, safe file parsing, scoped tools, prompt injection defenses, auditability, and incident response.

## APIs and events
API contracts, versioning, errors, idempotency, and tests governed by `API_CONTRACTS.md`. Audit events and provenance governed by `AUDIT_AND_PROVENANCE_STANDARD.md`. Agent messages governed by `AGENT_COMMUNICATION_PROTOCOL.md`. CoC-1 portable verification record governed by `COC1_VERIFICATION_STANDARD.md`.

## Quality, operations, and recovery
`TESTING_AND_VERIFICATION_STRATEGY.md`, `DEPLOYMENT_AND_RELEASE_RUNBOOK.md`, `FAILURE_RECOVERY_AND_FALLBACKS.md`, `BACKUP_AND_DISASTER_RECOVERY.md`, and `INCIDENT_RESPONSE.md` define expected operating controls. `OPERATIONS.md` remains the environment-specific companion.

## Nonfunctional requirements
- Security: deny by default, tenant isolation and access negative tests.
- Integrity: deterministic fingerprints and validation of recorded chains.
- Reliability: bounded retries, idempotent side effects, restore-tested backups.
- Observability: correlated logs/metrics/traces with privacy-aware redaction.
- Usability: understandable status labels, accessible review and approval.
- Interoperability: versioned API, agent envelopes, and verification exports.
- Performance: measurable targets defined by product owners and load tests.
- Privacy: data minimization, retention, legal hold, and deletion workflows.
- Audit: attributable event history for relevant actions.

## Acceptance gates
A feature is accepted only when: requirements and owner identified; data classification/scope specified; API and schema documented; authorization and negative tests pass; audit/provenance coverage included; UI states do not overclaim; failure modes are handled; tests and evidence linked; operational runbook updated; privacy/legal review completed when warranted.

## Known implementation status
This document is an intended specification, not a declaration that each capability is deployed. Maintain a requirements-to-code/test matrix and explicitly label each requirement **implemented**, **partial**, **planned**, **blocked**, or **unknown** with evidence.

## Change control
Changes to verification semantics, permission boundaries, audit schemas, retention, or legal-facing claims require domain/security/legal review as applicable. Update linked docs and versioned contracts together.
