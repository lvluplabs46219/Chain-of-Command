# Deployment and Release Runbook
**Status:** Baseline runbook; reconcile with current Vercel/Supabase/daemon configuration.

## Environments
Document development, preview/staging, and production separately: URLs, project IDs, data boundaries, secrets owners, integrations, and deployment permissions. Production credentials and data must not be used in local or preview environments without explicit policy.

## Pre-release checklist
- Review change, acceptance criteria, migration, security and privacy impact.
- CI lint/typecheck/unit/integration/contract/e2e/security gates pass.
- Environment variables present, least-privilege, and validated without printing values.
- Database migrations reviewed, backup taken, forward/rollback strategy documented.
- API compatibility and feature flags reviewed.
- Approval gates, audit events, and telemetry verified.
- Release notes, owner, rollback criteria, and incident contact prepared.

## Deploy
1. Confirm target environment and commit SHA.
2. Deploy preview/staging; validate health, key flows, authz, data writes, integrations, and agent connectivity.
3. Obtain release approval as required.
4. Promote/deploy production using the configured platform’s approved process.
5. Run smoke tests and inspect error/latency/security metrics.
6. Record deployment actor, timestamp, commit, migration versions, result, and rollback decision.

## Rollback
Rollback application to last known-good release when criteria trigger. Database rollback is not assumed safe; prefer backward-compatible migrations and documented compensating procedures. Disable feature flags or isolate unhealthy integrations if safer. Preserve audit logs and data.

## Post-release
Monitor through defined observation window, close release record, update docs/runbooks, and file incidents for unexpected impact.

## Operational values
Record exact project IDs, CLI commands, health endpoints, threshold values, and team contacts in a protected environment-specific operations guide. This document does not invent those values.
