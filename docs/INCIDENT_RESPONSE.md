# Incident Response
**Status:** Baseline; establish severity definitions and on-call roster operationally.

## Incident triggers
Suspected unauthorized access or disclosure; cross-tenant exposure; evidence/audit tampering; lost or corrupted evidence; credential/key compromise; malicious agent/tool behavior; production outage; legal hold failure; or materially incorrect verification status.

## Roles
Incident commander coordinates; security lead investigates containment; service owner restores; privacy/legal lead assesses obligations and holds; communications lead manages approved notifications. Record actual assigned people/contacts in protected operational docs.

## Lifecycle
1. **Detect and report:** preserve alert, reporter, time, scope.
2. **Triage:** severity, affected tenants/matters, data, systems, duration, confidence.
3. **Contain:** revoke credentials, disable agent/tool/integration, restrict access, isolate service, stop affected workflows.
4. **Preserve:** capture logs, event records, hashes, snapshots, and chain of custody; avoid altering relevant evidence.
5. **Investigate:** establish timeline, entry vector, impacted assets/records, root cause, and uncertainty.
6. **Eradicate/recover:** patch, rotate, restore, validate integrity and permissions, then staged re-enable.
7. **Notify:** follow legal/contractual/regulatory timelines and approved communication; do not speculate.
8. **Post-incident:** lessons learned, corrective action owners/dates, updated threat model and runbooks.

## Agent-specific containment
Stop dispatch, revoke capabilities/tokens, quarantine output, preserve task envelope and tool audit, inspect prompt/source injection and external egress. Human review affected outputs and actions.

## Evidence handling
Use incident ID; record each acquisition, digest, storage location, actor, and transfer. Protect incident records from unauthorized access. Legal hold may apply.

## Reporting
Capture impact, timeline, systems, data types, detection, decisions, notifications, recovery, RPO/RTO, root cause, residual risk, and remediation. Do not include credentials or unnecessary personal data.

## Exercises
Run tabletop and technical drills periodically. This template is not legal advice; notification decisions require qualified counsel and applicable policy.
