# Source Verification Protocols

A systematic exploration for a primary-source-first legal platform (Chain of Command / Acquit) and for any “facts-only” news surface built on the same foundation.

**Status:** Operational target (maturity level 2) — contracts in `@chain-of-command/legal-library` (`source-verification.ts`).  
**ADR:** `docs/adr/ADR-002-source-verification-protocol.md`

## 1. Purpose and Scope

Source verification is the set of rules, checks, metadata, and human/agent processes that answer three questions for every piece of legal or factual content:

1. **What is the ultimate primary source?** (statute text, court opinion, official agency release, authenticated government record)
2. **Has that source been correctly retrieved, quoted, or summarized?**
3. **Can a user (or another agent) independently re-verify the claim?**

In a platform that claims high factual integrity, verification is not a post-processing step; it is a continuous invariant that must hold from ingestion through RAG retrieval, research-report generation, news rendering, fine-tuning data approval, and audit logs.

## 2. Core Layers of Verification

| Layer | What is checked | Typical mechanisms | Failure mode if skipped |
|-------|-----------------|--------------------|-------------------------|
| Identity | Is this the authentic document? | Official domain, digital signature, hash, versioned government API, CourtListener/RECAP identifiers, GPO/govinfo links | Forged or altered text enters the system |
| Provenance | Where did this copy come from and when? | Retrieval timestamp, retrieving agent/user, source URL or document ID, parent research-packet ID | Orphaned claims that cannot be traced |
| Integrity | Has the content been altered since retrieval? | Content hash, page-level or paragraph-level checksums, comparison against canonical source | Silent corruption or malicious edit |
| Attribution | Exactly which sentences or numbers came from which source? | Inline citations, span-level source mapping, structured claim → source pairs | Hallucinated or mixed attributions |
| Currency | Is the source still current? | Effective dates, amendment history, later-overruling opinions, “last checked” timestamp | Outdated law presented as current |
| Completeness / Context | Are material limitations or counter-sources present? | Explicit gap notes, dissenting opinions, later circuit splits, “research incomplete” flags | Misleading by omission |

## 3. Practical Protocol Stack

### A. Ingestion Gate

- Only accept sources from an allow-list of official or high-trust origins (`PRIMARY_SOURCE_ALLOWLIST` in code).
- Record: source URL or document ID, retrieval timestamp, retrieving agent, content hash, MIME type, page count or character length.
- Reject or quarantine anything that fails authenticity signals (mismatched domain, missing expected metadata, hash mismatch on re-fetch).

### B. Chunking with Source Anchors

Every RAG chunk carries: canonical source identifier, exact locator, content hash of the chunk, parent document hash.

### C. Claim-Level Grounding at Generation Time

Generative steps emit structured `ClaimObject` values (see `source-verification.ts`), not free-form prose alone.

```json
{
  "claim_text": "...",
  "sources": [
    {
      "type": "statute",
      "cite": "31 U.S.C. § 3729(a)(1)(A)",
      "locator": "...",
      "hash": "...",
      "retrieved": "2026-11-13T..."
    }
  ],
  "confidence": "high|medium|low|unverified",
  "gaps_noted": ["full DOJ statistics sheet not retrieved"]
}
```

The rendering layer refuses to display a claim that lacks at least one verifiable source pointer, or marks the claim as **unverified**.

### D. Re-verification & Freshness

Periodic or on-demand re-fetch for high-value documents; supersession flags; visible “last verified” timestamps.

### E. Human and Multi-Agent Review Gates

High-impact outputs pass: `draft` → `source_checked` → `approved` | `rejected`.  
Audit log records who/what approved and which sources were inspected.

### F. User-Facing Verification Tools

One-click jump to original source; “challenge this claim” flow; transparent residual gaps.

## 4. Facts-Only News Surface

- No claim without a live source link.
- Headlines constrained to checkable statements.
- Automatic inclusion of material limitations from the research packet.
- Clear labeling of generation method, review status, and last verification time.
- Separation of platform-generated (source-linked) content from user discussion threads.
- Published inclusion policy preferred over unstated editorial filters.

## 5. Edge Cases

| Scenario | Mitigation |
|----------|------------|
| Source later corrected | Re-fetch + supersession links + “updated” banner |
| Partial retrieval | Explicit gap flags; refuse high-confidence labeling |
| Conflicting primaries | Surface both sources and note the conflict |
| Loose paraphrase | Prefer extractive spans; claim-to-span mapping |
| User-submitted “source” | Strict allow-list + quarantine + human review |
| Training data | Only `approved` rows with primary-source provenance enter SFT |

## 6. Relationship to Existing CoC Invariants

- **Citation grounding** — user-visible expression of verification (`grounding-guard.ts`).
- **Audit & provenance** — immutable log (`packages/audit`).
- **RAG / Law Library** — storage layer carrying required metadata.
- **Approved-data rules** — fine-tuning only verified completions.
- **“Capability not verified”** — correct output when the protocol cannot complete a check.

## 7. Implementation Maturity

| Level | Scope |
|-------|--------|
| Minimal | Allow-list + content hash + source URL + retrieval timestamp |
| **Operational (current target)** | Claim-level mapping, gap notes, structured audit events, view-source pointers |
| Robust | Span-level anchoring, supersession detection, multi-agent verification workers |
| Advanced | Cryptographic provenance chains, continuous eval, external authenticity services |

## 8. Code entry points

| Artifact | Role |
|----------|------|
| `packages/legal-library/src/source-verification.ts` | ClaimObject, IngestionRecord, allow-list, hash, normalizeClaims |
| `packages/legal-library/src/citations.ts` | SOURCE_REGISTRY tiers |
| `packages/legal-library/src/grounding-guard.ts` | Post-generation grounding check |
| `packages/audit` | `verification.*` audit actions |
| `apps/web/src/app/api/ai/lawyer/route.ts` | Emits `claims` / ClaimBundle on responses |

## 9. Open design decisions (see ADR-002)

Allow-list v1 frozen to `PRIMARY_SOURCE_ALLOWLIST`. Mapping: constrained abstractive with mandatory claim→source pairs. Approver: human **or** verification agent. Conflicts: surface all primaries + conflict note. UI: core status by default; full metadata on demand.
