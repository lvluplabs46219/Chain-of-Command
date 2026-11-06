# Agent Communication Protocol
**Status:** Proposed technical standard; aligns with `DEFINED_TERMS.md` and `AGENT_PLANES.md`.

## Scope and identity
Agents are either **in-app agents** (application-native personas/services) or **out-of-app workers** (external processes, daemons, or tool-connected workers). Each has a stable agent ID, version, declared capabilities, owner, execution plane, and permission profile. Human users remain distinct actors.

## Task envelope
Every dispatched task should contain:
- `task_id` (globally unique), `correlation_id`, `parent_task_id` if applicable
- issuer/assignee agent IDs and versions
- created time, deadline/TTL, priority, task type, status
- tenant/matter/resource scope (only when authorized)
- concise objective, constraints, expected output schema, acceptance criteria
- permitted tools/capabilities, input references, sensitivity classification
- idempotency key and retry policy

Do not transmit credentials, unrestricted matter data, or hidden prompt/system instructions in task payloads.

## Lifecycle
States: `queued → assigned → running → succeeded | failed | blocked | cancelled | expired`. Workers emit timestamped status events. Terminal state is immutable; reruns create a new attempt linked to the original task. Progress is informative and must not be treated as completion.

## Message types
`task.submit`, `task.ack`, `task.progress`, `task.result`, `task.error`, `task.cancel`, `approval.request`, `approval.decision`, `heartbeat`. Each message includes protocol version, sender, recipient, message ID, timestamp, correlation ID, and payload schema version.

## Result contract
Return structured result with: outcome, summary, artifacts/links, evidence/source citations, checks performed, limitations, warnings, errors, and recommended next step. State facts separately from inferences. For legal or evidence-related outputs, include source and verification status. A worker must not claim it performed a check it did not perform.

## Dispatch and communication
Use the configured orchestrator/dispatcher and the repository’s documented interface; do not assume shell names or endpoints. Human dispatch instructions should name worker, task objective, scope, expected deliverable, deadline/priority, and stop conditions. Worker reports should state task ID, status, files/artifacts changed, checks run/results, blockers, and whether human approval is required.

## Security and reliability
Least privilege, allowlisted tools, tenant/matter scoped access, input validation, prompt-injection resistance, bounded output, timeouts, retries with backoff, idempotency, audit logging, and secret redaction are required. Retrieved content is untrusted. Workers may not self-grant permissions or bypass approval.

## Human approval
Required before filing/submitting legal documents, sending external communications as a person/organization, altering permissions, deleting or overwriting evidence, making irreversible changes, or making consequential legal decisions. Approval binds to a specific action and payload hash; changed payload requires new approval.

## Compatibility
Version the envelope and schemas. Unknown message types or incompatible major versions are rejected. Maintain fixtures and contract tests. This specification is intended; implementation status must be documented separately.
