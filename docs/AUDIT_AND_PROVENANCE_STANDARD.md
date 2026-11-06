# Audit and Provenance Standard
**Status:** Proposed normative standard.

## Purpose
Make consequential actions, evidence history, research provenance, and agent activity attributable and reviewable. Auditability is not a substitute for legal authenticity or admissibility.

## Event fields
Minimum: event ID, schema version, sequence (within defined stream), UTC timestamp, actor ID/type, tenant/matter scope, action, resource type/ID, outcome, reason/context, correlation/task ID, source reference, previous-event hash, event hash, and integrity algorithm/version. Include payload digest when appropriate; avoid sensitive payload duplication.

## Integrity
Canonicalize event serialization deterministically before hashing. Hash must cover required fields and previous hash. Record algorithm and canonicalization version. Validate sequence continuity and linkage; report tamper, gap, unknown algorithm, and incomplete stream separately. Genesis event rules must be explicit. Keyed signatures and external anchoring are separate optional controls with key custody documented.

## Append-only behavior
Do not update or delete audit history in place. Corrections, redactions, or superseding facts are new events referencing the original. Restrict write paths and administrative access. If legal deletion is required, define a controlled tombstone/redaction approach with counsel that preserves the integrity claims that remain possible.

## Provenance for evidence and research
Record acquisition actor, method, source URI or identifier, acquired time, original filename/media type/size, SHA-256 fingerprint (algorithm labeled), transformations, extraction tool/version, and links to parent/original artifact. Store derived artifacts separately and link them. Record source access date, publication/version date if known, citation locator, and source snapshot/fingerprint where permitted.

## Agent events
Track task creation, dispatch, worker/version, inputs references, capability grants, tool calls, approval decisions, completion, failures/retries, outputs, and human review. Minimize and redact logs; traceability must not expose secrets.

## Verification and presentation
Audit checks return structured status and evidence. UI labels must distinguish byte integrity, chain integrity, source verification, signature verification, custody continuity, and legal review. Never label the whole record “authentic” solely because hashes match.

## Retention, access, and tests
Apply classification and retention policy. Restrict audit access and log access itself when warranted. Test event tampering, sequence gaps, missing previous links, canonicalization changes, duplicate events, and unauthorized writes. Preserve test results and known limitations.
