# Data Lifecycle and Privacy
**Status:** Proposed governance baseline. Final retention periods require owner/legal review.

## Data categories
- Identity and account data
- Tenant, matter, and case metadata
- Evidence/document bytes and extracted text
- Source references, citations, verification results
- Agent tasks, prompts, outputs, tool traces
- Audit/security events and approvals
- Operational telemetry and diagnostics

Assign sensitivity labels (e.g. public, internal, confidential, restricted) using the product’s approved classification policy. Legal matter/evidence data should default to restricted until classified.

## Lifecycle
1. **Collect:** only necessary data; identify purpose, actor, source, and scope.
2. **Ingest:** validate, malware scan, fingerprint bytes, preserve source/acquisition metadata.
3. **Use:** access only for authorized matter purposes; agents receive minimized context.
4. **Share:** verify recipient, authority, scope, and approval; avoid public links by default.
5. **Store:** encryption, tenant isolation, backups, key governance, access logs.
6. **Retain:** use matter-specific retention schedule, legal holds, contractual and legal obligations.
7. **Archive:** preserve integrity and access controls; record archive location and retrieval procedure.
8. **Delete/dispose:** authorized deletion from active systems and eligible replicas; document residual backup expiration. A legal hold suspends routine deletion.
9. **Review:** periodically inventory data stores, integrations, access, retention, and deletion status.

## Privacy principles
Purpose limitation, minimization, accuracy, transparency, access controls, secure processing, retention limitation, and accountable handling. Do not place document contents, secrets, or unnecessary personal data in application logs, analytics, model prompts, or support tickets.

## AI processing
Record model/provider, task purpose, data categories sent, relevant policy/consent basis, version, sources, and output linkage where appropriate. Prefer local or approved providers for restricted data. Disclose and configure provider retention/training terms before production. Human review is required for consequential outputs.

## Data subject and matter workflows
Provide authorized paths to access, correct metadata, export, and delete where legally permitted. Corrections must preserve audit history. Verify requester identity and scope. Do not remove records subject to legal hold or mandatory preservation.

## Retention schedule
Create a maintained schedule by category with owner, retention trigger, duration, legal basis, hold behavior, disposal method, backup treatment, and review date. This document intentionally does not invent durations.

## Incident and breach
Suspected exposure, misrouting, unauthorized access, or loss must be escalated under `INCIDENT_RESPONSE.md`. Preserve relevant logs and evidence; avoid uncontrolled copying.

## Governance
Privacy owner approves classification and retention. Security owner reviews technical controls. Legal owner reviews holds, disclosures, and jurisdiction-specific obligations. This document is not legal advice or a compliance certification.
