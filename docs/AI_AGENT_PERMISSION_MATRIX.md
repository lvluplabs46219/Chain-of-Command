# AI Agent Permission Matrix
**Status:** Baseline; replace illustrative matrix with actual agent registry and capability IDs.

## Permission principles
Default deny; least privilege; permissions scoped to tenant, matter, resource, operation, and time. Capability is not the same as role. Tool permissions must be enforced server-side and not merely described in prompts.

## Capability bands
- **Read public:** search public sources, read public docs.
- **Read scoped:** read matter records/evidence explicitly authorized.
- **Create draft:** create draft notes, reports, analysis, tasks.
- **Modify scoped:** update noncritical metadata under rules.
- **External communication:** send email/messages or share artifacts.
- **High impact:** file/submission, delete evidence, alter access, approve legal action, execute irreversible operation.

## Default matrix (illustrative)
| Agent class | Public read | Matter read | Draft/create | Metadata modify | External send | High impact |
|---|---:|---:|---:|---:|---:|---:|
| Research agent | Yes | Scoped | Yes | No | No | No |
| Evidence intake agent | Yes | Scoped | Yes | Limited | No | No |
| Verification agent | Yes | Scoped | Results only | No | No | No |
| Case analyst | Yes | Scoped | Yes | Limited | No | No |
| Operations/health worker | System metadata | No matter content by default | Task/report | Config-scoped | No | No |
| Orchestrator | Metadata | Scoped routing only | Tasks | No | No | No |
| Human authorized reviewer | Role-dependent | Scoped | Yes | Role-dependent | Approval-gated | Approval-gated |

## Approval requirements
Human approval required for filings, external communications, permissions/security changes, evidence deletion or overwrite, data disclosure/export, financial commitments, and irreversible actions. Approval binds to action parameters and payload digest, expires, and is recorded. Changed scope/payload needs reapproval.

## Credential handling
Workers receive short-lived, scoped credentials or capability tokens. Never embed secrets in prompts, task logs, repositories, or static worker configuration. Rotate and revoke; audit grant and use.

## Agent registry
For every agent list ID, owner, version, runtime, execution plane, capabilities, scopes, data classifications, tools, approver, health signal, and decommission procedure. Review on release and periodically.

## Enforcement and tests
Enforce policy in gateway/service/tool layer. Tests must prove allowed and denied cases, cross-tenant denial, approval bypass denial, expired token denial, and revocation. This matrix is not an assertion that current agents already obey these controls.
