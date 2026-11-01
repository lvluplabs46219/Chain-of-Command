# Chain of Command — Master Task List

**Source of truth for prioritization:** `docs/CHAIN_OF_COMMAND_FULL_APP_BLUEPRINT_REVISED.md` (v2.1)

Priorities balance blueprint Must-Haves, realistic ship probability for a new product, dependency order, and the explicit decision that Evidence Locker (beyond user-uploaded) and live court connectors are later-stage.

---

## P0 — Foundation (Must ship first)

1. **Tenancy, identity, MFA, sessions, RBAC + ABAC, RLS**
2. **Append-only, hash-chained audit trail**
3. **Result envelope system** (labeling + grounding + confidence + provenance)
4. **The Docket** — Cases + membership + jurisdiction/court/as-of
5. **Record Room core** — Document upload, immutable originals, versioning, extraction
6. **Chronology** — Timeline with proposed-vs-confirmed events
7. **The Wire core** — Agent manifests, model gateway, orchestration, envelopes
8. **Global notices & disclosures**
9. **Command Center shell**

## P1 — Core Product Value

10. **Charge Sheet** (Charge Explainer)
11. **Deadline Engine** (deterministic, explainable, version-pinned)
12. **Tasks / Action Items / Motion Board**
13. **Stacks** (hybrid research + grounding guard)
14. **Audits & Memos** (Rights Audit + Plea Analysis — structure only)
15. **Evidence Locker** (user-uploaded only)
16. **Draft Desk** (state machine, human-only approval)

## P2 — Strengthening

17. Stacks quality uplift
18. Mitigation Memo
19. Chronology polish
20. Agent team expansion
21. Hearing Prep Kit
22. Neutral Counsel Directory
23. Court Watch basic docket feed (manual/semi-manual + capability-not-verified status)

## P3 — Later / Explicitly Gated

24. Full multi-agent scale + Full Bench View
25. Citation Web
26. User-created agents (Appoint Counsel)
27. Evidence Locker expansion (court-sourced / official evidence)
28. Live / verified court docket connectors + Live Docket Sync
29. Chambers (real Conference Rooms)
30. Write-side or “almost filing” flows
31. Law Academy
32. Broad multi-jurisdiction maintenance + advanced Admin Console

**P3 rule:** Create a capability-not-verified register entry first. Define verification criteria. Gate behind feature flags + formal review.

---

## First Concrete Task (P0-1)

See issue / task definition for **Tenancy, Identity, MFA, Sessions, RBAC + ABAC, and Row-Level Security** (acceptance criteria, subtasks, CI gates, out-of-scope).

---

*Last updated: 2026-11-01*
