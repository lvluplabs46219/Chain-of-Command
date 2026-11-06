# Security Threat Model
**Status:** Baseline; update during each major architecture or threat change.

## Assets
Matter/case data, evidence bytes and metadata, user identities/sessions, agent credentials and tool permissions, audit records, source citations, approval records, keys/secrets, tenant configuration, and service availability.

## Security objectives
Confidentiality, integrity, availability, tenant isolation, attributable actions, evidence provenance, least privilege, and clear separation between cryptographic integrity and legal authenticity/admissibility.

## Threat actors and scenarios
- Unauthorized tenant/matter member or compromised account accesses another matter.
- Malicious uploaded file exploits parser, malware, or decompression limits.
- Prompt injection in evidence, email, webpage, or retrieved source manipulates an agent/tool.
- Agent or daemon compromise uses overbroad credentials or exfiltrates data.
- API abuse, brute force, resource exhaustion, replay, duplicate side effects.
- Insider or compromised service alters audit/evidence metadata.
- Secrets leak through logs, source control, build artifacts, or agent prompts.
- External source changes or disappears; citation becomes stale.
- Supply-chain compromise in dependencies, CI actions, or deployment.
- Backup compromise, ransomware, or untested restore.

## Trust boundaries
Client/API, authenticated/unauthenticated, tenant/matter, app/data stores, agent/tool execution, external providers, CI/deployment, and audit/anchor services.

## Minimum mitigations
1. Server-side authn/authz on every operation; deny by default.
2. Tenant/matter scoping and RLS where applicable; test cross-tenant negative cases.
3. Secure session lifecycle, MFA where available, revocation, rate limiting.
4. File type allowlists, size/time limits, malware scanning, safe isolated parsing.
5. Tool allowlists, capability tokens, narrow scope, sandboxing, egress controls.
6. Prompt-injection defenses: treat source content as data; require confirmation for side effects.
7. Secret vault/env management, rotation, least-privilege credentials, redaction.
8. Immutable/append-only audit patterns, hash-chain validation, external anchoring where adopted.
9. Dependency pinning, automated vulnerability checks, protected CI and reviews.
10. Encryption in transit/at rest, backup isolation, tested recovery.
11. Security headers, input/output validation, CSRF/CORS protections as applicable.
12. Monitoring, incident escalation, privacy-conscious logs.

## Risk register
Maintain each risk with ID, threat, affected assets, likelihood, impact, mitigation, owner, residual risk, and due date. Explicitly record unresolved items such as tenant isolation tests, leaked-password protection, audit-chain enforcement, session revocation, agent execution isolation, and CI red-team coverage if they remain open.

## Verification
Threat-model review; authz/RLS tests; upload abuse tests; injection/tool-use tests; secrets scanning; dependency scanning; audit tamper tests; backup restore exercise; incident tabletop. A control is not complete until its test/evidence is linked.

## Non-goals / caveat
This is a baseline engineering threat model, not a penetration-test report, legal compliance certification, or guarantee of security.
