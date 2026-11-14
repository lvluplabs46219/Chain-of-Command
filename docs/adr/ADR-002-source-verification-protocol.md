# ADR-002: Source Verification Protocol

**Status:** Accepted  
**Date:** 2026-11-13  
**Context:** Primary-source-first legal platform (Chain of Command / Acquit); facts-only news surface and fine-tuning gates depend on continuous verification invariants.

## Decision

Adopt the Source Verification Protocol (`docs/SOURCE_VERIFICATION_PROTOCOL.md`) as a first-class product invariant, implemented initially at **Operational** maturity:

1. **Allow-list (v1)** — `PRIMARY_SOURCE_ALLOWLIST` + expanded `SOURCE_REGISTRY` (govinfo, justice.gov, congress.gov, federalregister.gov, CourtListener/RECAP, selected state hosts).
2. **Claim schema** — generation paths emit `ClaimObject` / `ClaimBundle` with sources, confidence, and `gaps_noted`.
3. **Ingestion** — `ingestSource()` hashes content and quarantines non-allow-listed domains.
4. **Rendering** — claims without a verifiable source pointer are labeled `unverified`.
5. **Audit** — `verification.*` actions on the audit action union for ingest, check, approve, reject, challenge.
6. **Approver** — either a human reviewer **or** a designated verification agent may mark `source_checked` / `approved` (both must write audit events).
7. **Conflicts** — when multiple primaries conflict, surface all cited sources and an explicit conflict/gap note (no single-narrative collapse).
8. **UI defaults** — show verification status and confidence by default; full hash/locator metadata available on demand (“view source”).
9. **Mapping strictness** — prefer extractive spans; allow constrained abstractive text only when each factual claim carries at least one source pointer.

## Consequences

- Lawyer and research APIs should return `claims` alongside prose.
- News and SFT pipelines must refuse `approved` status without primary-source provenance.
- Span-level anchoring, automated supersession detection, and cryptographic provenance chains are **deferred** to Robust/Advanced maturity.

## Alternatives considered

- **Post-hoc citation scraping only** — rejected; does not provide ingestion integrity or review gates.
- **Extractive-only generation** — deferred as hard requirement; constrained abstractive with mandatory pointers is the near-term balance.
