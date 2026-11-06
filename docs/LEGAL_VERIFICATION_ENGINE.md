# Legal Verification Engine
**Status:** Product/technical specification; implementation and legal validation pending.

## Mission
Evaluate and communicate evidence/document verification dimensions with transparent methods, sources, confidence, and limitations. The engine supports professional review; it does not determine legal admissibility, prove truth, or replace counsel/court decisions.

## Independent dimensions
1. **Byte integrity:** fingerprint comparison against known digest.
2. **Source/provenance:** origin and acquisition path supported by evidence.
3. **Signature/seal:** cryptographic or platform validation, signer identity mapping, certificate trust and revocation checks when available.
4. **Currentness:** whether a source/document is latest or superseded, based on authoritative source and as-of date.
5. **Custody:** recorded transfer/access history and gaps.
6. **Context/authority:** jurisdiction, issuing body, document type, applicability, and source authority.
7. **Legal review:** human-reviewed assessment of relevant legal issues, explicitly attributed.

## Result schema
Recommended fields: verification_id, record/resource_id, dimension, status (`verified`, `not_verified`, `failed`, `unknown`, `unavailable`, `conflict`), method, verifier/service and version, checked_at, as_of, evidence references, source references, confidence (with definition), limitations, errors/warnings, reviewer/approval if applicable.

## Workflow
Intake → classify → acquire/record source → fingerprint → run relevant dimension checks → preserve evidence/results → surface conflicts and missing checks → human review where needed → refresh on schedule or trigger → record superseding verification. Never collapse dimensions into one unqualified pass/fail.

## Source authority
Maintain source registries by jurisdiction/document class, with owner, URL/domain, authority rationale, access method, freshness policy, and fallback. Secondary sources can support research but do not silently substitute for an authoritative source.

## Controls
Checks are explainable and reproducible where feasible. Preserve versions and inputs. External dependencies fail to “unavailable,” not “passed.” Human overrides record identity, rationale, time, and evidence. Use role-based permissions.

## Validation
Benchmark against reviewed examples, adversarial cases, expired/revoked signatures, altered bytes, stale documents, source conflicts, and missing custody events. Legal-domain experts approve the evaluation criteria. No certification claims without external evidence.
