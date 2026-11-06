# Documentation Index
**Repository:** Chain of Command  
**Purpose:** Find governing specifications, implementation guides, operational runbooks, and agent workforce instructions.

> Status labels describe documentation maturity, not necessarily shipped software. Verify implementation and test evidence before treating a requirement as complete.

## Governing specification and domain
- [Master System Specification](MASTER_SYSTEM_SPECIFICATION.md) — consolidated product and system requirements (**Draft**)
- [Chain of Command Architecture](CHAIN_OF_COMMAND_ARCHITECTURE.md) — high-level architecture
- [Data Model](DATA_MODEL.md) — domain persistence model
- [Defined Terms](DEFINED_TERMS.md) — vocabulary and two workforce groups
- [Agent Planes](AGENT_PLANES.md) — in-app/out-of-app agent architecture
- [System Data Flow](SYSTEM_DATA_FLOW.md) — trust boundaries and end-to-end flow (**Proposed**)

## Agent workforce and AI
- [Agent Communication Protocol](AGENT_COMMUNICATION_PROTOCOL.md) — dispatch, envelope, lifecycle, result format (**Proposed**)
- [AI Agent Permission Matrix](AI_AGENT_PERMISSION_MATRIX.md) — capability and approval baseline (**Proposed**)
- [AI Gateway](AI_GATEWAY.md) — model routing and fallback behavior
- [Fine Tuning Pipeline](FINE_TUNING_PIPELINE.md)
- [Ollama Fine Tune](OLLAMA_FINETUNE.md)
- [Automated Patch Verification Loop](AUTOMATED_PATCH_VERIFICATION_LOOP.md)

## Evidence, legal verification, and research
- [Legal Verification Engine](LEGAL_VERIFICATION_ENGINE.md) — verification dimensions (**Draft**)
- [CoC-1 Verification Standard](COC1_VERIFICATION_STANDARD.md) — portable record (**Draft**)
- [Evidence Chain of Custody](EVIDENCE_CHAIN_OF_CUSTODY.md) — evidence handling baseline (**Proposed**)
- [Audit and Provenance Standard](AUDIT_AND_PROVENANCE_STANDARD.md) — event integrity and source traceability (**Proposed**)
- [Legal Source Grounding](LEGAL_SOURCE_GROUNDING.md) — citation and currentness standard (**Proposed**)
- [Law Library](LAW_LIBRARY.md)

## API, security, privacy, quality
- [API Contracts](API_CONTRACTS.md) — API schemas, versioning, error and test rules (**Proposed**)
- [Security Threat Model](SECURITY_THREAT_MODEL.md) — threat inventory and mitigations (**Baseline**)
- [Data Lifecycle and Privacy](DATA_LIFECYCLE_AND_PRIVACY.md) — classification, retention, deletion (**Proposed**)
- [Testing and Verification Strategy](TESTING_AND_VERIFICATION_STRATEGY.md) — quality gates (**Baseline**)
- [Security Review P0.1](SECURITY_REVIEW_P0_1.md) — findings and open controls

## Operations and delivery
- [Operations](OPERATIONS.md) — current operational notes
- [Deployment and Release Runbook](DEPLOYMENT_AND_RELEASE_RUNBOOK.md) — release process (**Baseline**)
- [Failure Recovery and Fallbacks](FAILURE_RECOVERY_AND_FALLBACKS.md) — service recovery (**Proposed**)
- [Backup and Disaster Recovery](BACKUP_AND_DISASTER_RECOVERY.md) — recovery objectives and restore (**Baseline**)
- [Incident Response](INCIDENT_RESPONSE.md) — incident handling (**Baseline**)
- [Onboarding](ONBOARDING.md)
- [Infisical Setup](INFISICAL_SETUP.md)
- [Key Rotation](KEY_ROTATION.md)
- [Phase 0 Checklist](PHASE0_CHECKLIST.md)

## Product design, planning, and sessions
- [Design](DESIGN.md)
- [Design Direction](DESIGN_DIRECTION.md)
- [Empyrean](EMPYREAN.md)
- [The Wire](THE_WIRE.md)
- [Master Task List](MASTER_TASK_LIST.md)
- [Todo Tracker (CSV)](Chain_of_Command_Todo_Tracker.csv)
- [Full App Blueprint](CHAIN_OF_COMMAND_FULL_APP_BLUEPRINT_REVISED.md)
- [Master Implementation Prompt v2](MASTER_IMPLEMENTATION_PROMPT_v2.md)
- [Carousel Want Audit](CAROUSEL_WANT_AUDIT.md)
- [ADR-001 Auth Backend](ADR-001-auth-backend.md)
- [Session 2026-10-09](SESSION_2026-10-09.md)
- [Gemini](GEMINI.md)

## Doc upkeep rules
1. New architecture or behavior must update the appropriate spec and index.
2. Distinguish implemented behavior from planned requirements; cite code/tests/PRs.
3. Keep version, status, owner, and review date on high-impact specs.
4. Never put secrets, private credentials, or real restricted matter details in docs.
5. Review security, privacy, legal-verification, and operational docs after material changes.
