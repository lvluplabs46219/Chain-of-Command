# Evidence Chain of Custody
**Status:** Proposed operating and data standard.

## Objective
Maintain a traceable history of evidence acquisition, handling, transformation, access, transfer, storage, and disposition. Record gaps honestly; do not reconstruct undocumented custody as fact.

## Intake
For each original artifact, record unique evidence ID, matter scope, collector/actor, acquisition timestamp and timezone, source/method, original name, media type, byte size, SHA-256 digest (algorithm explicitly recorded), condition/notes, and storage reference. Preserve the original read-only when policy and law permit.

## Custody event model
Each event contains event ID, evidence ID, actor, event type, UTC timestamp, location/system, action/reason, prior and resulting state, related task/approval, event sequence, previous hash/hash where ledger support exists, and supporting references. Types include collected, received, copied, accessed, transferred, transformed, sealed, unsealed, exported, archived, and disposed.

## Derived artifacts
Never overwrite the original with OCR, redaction, conversion, annotation, or compression. Create derivative ID, parent/original ID, transformation description, tool/version, actor, timestamp, input/output digest, and quality limitations.

## Access and transfer
Authorize by matter scope and role. Log material access and transfers where required. Export/transfer should capture recipient, channel, purpose, approval, package digest, and receipt acknowledgement if available. Protect data in transit and at rest.

## Exceptions
Report missing events, clock uncertainty, mismatched hashes, duplicate/ambiguous artifacts, storage outage, and unauthorized access. Preserve discrepancy investigation as a new event. Do not label custody “continuous” when gaps exist.

## Integrity verification
Recompute digest from stored bytes; compare to intake digest; validate event sequence and chain links. Record tool/version and timestamp. A hash chain can reveal alteration of recorded events but does not prove events were truthful or that custody was complete.

## Retention and legal hold
Follow approved retention schedule and matter holds. Disposal requires authorization and event record, including method and applicable backup limitations.

## Human/legal review
Custody reports are factual system records; legal sufficiency and admissibility require qualified review.
