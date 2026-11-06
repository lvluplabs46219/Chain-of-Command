# CoC-1 Verification Record Standard
**Status:** Draft schema concept; not a finalized public standard.

## Purpose
Define a portable record describing what was checked for an evidence/document object and the basis/results of those checks. CoC-1 is a verification envelope, not a legal conclusion.

## Core record
- `standard`: `CoC-1`; `schema_version`
- `record_id`, `resource_id`, `tenant_id` (omit tenant data from public export unless authorized)
- `subject`: filename/title, media type, byte length, digest algorithm and digest
- `provenance`: source identifier/URI, acquisition method/actor/time, parent artifact
- `checks[]`: dimension, status, method, verifier/version, checked_at, evidence refs, source refs, limitations, errors/warnings
- `custody_events[]`: event references or included signed/hashed records
- `audit`: event stream ID, sequence range, chain validation result
- `attestations[]`: signer identity claim, signature format, signature bytes/reference, certificate and validation context (where applicable)
- `currentness`: authoritative source, checked time, publication/effective dates, supersession result
- `review`: human reviewer, scope, decision, rationale, timestamp (optional and permission-protected)
- `export`: generated time, exporter/version, canonicalization method, package digest

## Status vocabulary
`verified`, `not_verified`, `failed`, `unknown`, `unavailable`, `conflict`, `not_applicable`. A missing check is never inferred as verified.

## Canonicalization and signatures
Any signed or hashed envelope must specify canonical serialization, encoding, digest/signature algorithms, version, and verification procedure. Algorithm agility is required; do not assume one algorithm indefinitely. Do not sign a mutable representation without defining canonicalization.

## Privacy and security
Exports are access-controlled and minimize personal/matter data. Public anchoring should contain only approved digests/commitments, not confidential document content or identifiers. Verify signatures and access rights before relying on an attestation.

## Conformance
A validator checks schema, required fields, digest formatting, status vocabulary, timestamps, reference integrity, canonicalization version, and signature/chain validity where included. Conformance test vectors and a validator implementation are required before calling this standard stable.

## Limitations
A matching digest establishes byte identity relative to the supplied digest. It does not by itself establish origin, signer identity, truth, legality, or admissibility.
