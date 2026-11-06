# Backup and Disaster Recovery
**Status:** Baseline requirements; RPO/RTO values require business-owner approval.

## Scope
Database, evidence/document object storage, audit/provenance records, configuration, agent task state, and essential deployment artifacts. Secrets are backed up through the approved secret manager—not plain repository files.

## Requirements
- Define service-specific recovery point objective (RPO) and recovery time objective (RTO).
- Enable managed backups and point-in-time recovery where supported.
- Protect backups with encryption, separate access controls, and account/project isolation.
- Ensure evidence blobs and metadata are backed up consistently; document cross-store reconciliation.
- Retain backup inventory, timestamps, integrity checks, and restore logs.
- Avoid treating replica or same-account copy as complete disaster recovery.

## Restore procedure
1. Declare recovery incident and assign incident commander.
2. Select known-good backup and target isolated environment.
3. Restore database and object storage/config according to service-specific runbook.
4. Validate schema/migrations, record counts, access controls, tenant boundaries, evidence digests, audit-chain continuity, and application health.
5. Reconcile objects/events created after recovery point using safe replay and idempotency.
6. Approve cutover, communicate, monitor, and preserve recovery evidence.

## Testing
Perform periodic restore drills, including partial restore and integrity checks. Record date, RPO achieved, RTO achieved, gaps, owners, and remediation. Backups are not proven recoverable until restored and tested.

## Data retention and holds
Apply approved retention and legal-hold rules to backup expiration. Document deletion limits and residual copies.

## Contacts and configuration
Maintain protected service-specific details: backup schedules, storage locations, IAM roles, console/CLI procedures, encryption key recovery, and escalation paths. Do not put secret material in this document.
