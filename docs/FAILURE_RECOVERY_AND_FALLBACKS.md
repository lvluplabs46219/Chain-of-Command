# Failure Recovery and Fallbacks
**Status:** Proposed resilience runbook.

## Principles
Fail closed for authorization, privacy, integrity, and approvals. Fail visibly for verification dependencies. A fallback must not reduce the stated assurance level without disclosure.

## Failure classes
- API/database/storage unavailable
- Agent daemon/socket offline or heartbeat stale
- Model/provider timeout, quota, refusal, or malformed output
- Source site unreachable, changed, or contradictory
- Verification provider unavailable
- Queue backlog, duplicate delivery, task timeout
- Audit event write/chain validation failure
- Deployment/migration failure
- Key/credential expiration or suspected compromise

## Response behavior
1. Return safe error with request/correlation ID.
2. Preserve input and task state only where permitted and durable.
3. Use bounded retries with exponential backoff and jitter; avoid retrying non-idempotent effects without idempotency.
4. Mark dependency checks `unavailable` or task `blocked`; never fabricate success.
5. Offer alternate provider only if policy-approved and output provenance records the fallback.
6. For audit write failure, stop or quarantine consequential action; do not proceed without required auditability.
7. For agent outage, queue bounded tasks or notify operator; do not route to unapproved worker.
8. For integrity mismatch, quarantine affected object and escalate.

## Recovery sequence
Detect → classify/severity → protect data and stop risky actions → notify owner → inspect logs/metrics → restore dependency/service → reconcile pending tasks/events → validate integrity and health → communicate status → document root cause and corrective actions.

## Replay/reconciliation
Use task IDs, idempotency keys, event IDs, and checkpoints. Replay only known-safe operations. Record replay attempts. Reconcile orphaned tasks and missing audit events with explicit incident entries, not silent edits.

## Runbook-specific details
Maintain service owner, alert, dashboard, commands, dependencies, backup/restore path, rollback, and escalation contact per component. Test scenarios regularly.

## Fallback disclosures
User-facing messages identify unavailable capability, fallback used, assurance limitations, and whether human review is needed. Template or local-model fallback must not be presented as authoritative legal analysis.
