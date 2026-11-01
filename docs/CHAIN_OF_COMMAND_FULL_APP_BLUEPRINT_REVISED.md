# Chain of Command — Full App Blueprint (Revised)

**Version:** 2.1 (Revised 2026-11-01)  
**Status:** Living document — prioritization and information architecture updated from original source contract  
**Source lineage:** Chain_of_Command_Full_App_Blueprint.pdf + themed IA + realism assessment + master task list

---

## 1. App Concept (Unchanged in Spirit)

**App Name:** Chain of Command (working title)

**Core Purpose:** A legal operating system for people who cannot afford or otherwise cannot reach an attorney — understand charges and terminology, organize the case, research the law with grounded citations, analyze documents, construct a timeline, track deadlines through a deterministic rules engine, prepare for court, draft documents for review, and locate human counsel. AI is a permissioned team, not a chatbot.

**Prime directive:** Increase effective access to legal information and self-representation capability — without ever misrepresenting what the system is, overstating what it knows, or performing an external legal action on the user’s behalf.

**Operating contract (shown to users):**

> “This is a tool that helps you understand, organize, research, and prepare. It is not a lawyer. It does not give you legal advice as your attorney. It does not file, submit, contact, or act for you. It shows you where its information comes from. When it is unsure, it tells you so. You remain in control of every decision and every action.”

**Main Output — every AI result is a typed envelope:**
- Structured payload
- Labeling: Information / Analysis / Draft (later User-edited / Final)
- Grounding status: grounded / partially grounded / ungrounded + plain-language note
- Citations with authority, pinpoint, verification status, credibility tier (1–4)
- Confidence: low / medium / high + basis
- Provenance: agent + version, model + version, prompt + version, run id
- Disclosures, approvals required, “what we could not verify”, traceId

---

## 2. Revised Information Architecture (Themed Navigation)

The product is organized into the following primary sections. Items 3–9 in the original navigation have been remapped into a calmer, professional legal workspace.

### Primary Navigation

| Section              | Purpose                                                                 | Scope          |
|----------------------|-------------------------------------------------------------------------|----------------|
| **Command Center**   | Cross-case and case overview dashboard                                  | Global + Case  |
| **The Docket**       | Case list, create case, matter status                                   | Global         |
| **The Wire**         | AI Legal Team — orchestration, agent chat, telemetry, configuration     | Case-scoped    |
| **Law Library**      | Research, documents, evidence, chronology, audits & memos               | Case-scoped    |
| **Court Watch & Tasks** | Deadlines, docket activity, hearings, tasks, motion board            | Case-scoped    |
| **Chambers**         | Court communication (judge / prosecutor / clerk) — *later phase*        | Case-scoped    |
| **Law Academy**      | Education, rules, procedure, moot practice — *later phase*              | Global         |
| **Settings**         | Profile, security, notifications, reading level, data & privacy, AI defaults | Global     |

**Global elements:**
- Menu bar: File / Edit / View / Team
- Notification bell: **The Clerk**
- Persistent case switcher (mobile) / left sidebar (desktop)

### Law Library Internal Tabs

| Tab                  | Themed Name          | Primary Contents                                      | Priority Focus      |
|----------------------|----------------------|-------------------------------------------------------|---------------------|
| Research             | **Stacks**           | Search, Volume Cards, Research Brief, filters, Case Research | P0–P1 core         |
| Documents            | **Record Room**      | Filing Table, upload, preview, Draft Desk, versions   | P0–P1 core         |
| Timeline             | **Chronology**       | Event canvas, proposed vs confirmed, Event Record     | P0–P1 core         |
| Evidence             | **Evidence Locker**  | User-uploaded evidence only (cards, tags, chain notes)| P1 (user-uploaded) / P3 (court-sourced) |
| Structured Analysis  | **Audits & Memos**   | Rights Audit, Plea Analysis, Mitigation Memo          | P1                 |

---

## 3. Priority Ranking & Phasing (Updated)

Prioritization now explicitly balances:
1. Blueprint Must-Haves
2. Realistic ship probability for a new/upcoming product
3. Dependency order
4. Explicit decision: Evidence Locker beyond pure user-uploaded evidence and live court connectors are later-stage

### P0 — Foundation (Must ship first)
1. Tenancy, identity, MFA, sessions, RBAC + ABAC, RLS
2. Append-only, hash-chained audit trail
3. Result envelope system (labeling + grounding + confidence + provenance)
4. The Docket — Cases + membership + jurisdiction/court/as-of
5. Record Room core — Document upload, immutable originals, versioning, extraction
6. Chronology — Timeline with proposed-vs-confirmed events
7. The Wire core — Agent manifests, model gateway, orchestration, envelopes
8. Global notices & disclosures
9. Command Center shell

### P1 — Core Product Value
10. Charge Sheet (Charge Explainer)
11. Deadline Engine (deterministic, explainable, version-pinned)
12. Tasks / Action Items / Motion Board
13. Stacks (hybrid research + grounding guard)
14. Audits & Memos (Rights Audit + Plea Analysis — structure only)
15. Evidence Locker (user-uploaded only)
16. Draft Desk (state machine, human-only approval)

### P2 — Strengthening
17. Stacks quality uplift
18. Mitigation Memo
19. Chronology polish
20. Agent team expansion
21. Hearing Prep Kit
22. Neutral Counsel Directory
23. Court Watch basic docket feed (manual/semi-manual + capability-not-verified status)

### P3 — Later / Explicitly Gated
24. Full multi-agent scale + Full Bench View
25. Citation Web
26. User-created agents (Appoint Counsel)
27. Evidence Locker expansion (court-sourced / official evidence)
28. Live / verified court docket connectors + Live Docket Sync
29. Chambers (real Conference Rooms)
30. Write-side or “almost filing” flows
31. Law Academy
32. Broad multi-jurisdiction maintenance + advanced Admin Console

**Rule for P3 items:** Create a capability-not-verified register entry first. Define what would verify the capability. Gate behind feature flags and formal review. Do not begin implementation until P0–P1 are solid and any required external relationships exist.

---

## 4. Section-by-Section Blueprint (Updated)

### 4.1 Command Center
**Role:** Primary dashboard and case overview.

**Must-Have Components (P0–P1):**
- Case File Banner (jurisdiction, court, stage, as-of)
- Docket Status badge
- Brief Stats cards
- Charge Sheet (Charge Explainer output)
- Chronology Rail (preview → full Chronology)
- Team Panel (preview → The Wire)
- Court Log (audit-backed activity feed)
- Urgent Notice / deadline alert banner

**May-Have / Later:**
- Case Digest (AI case summary)
- Venue Info
- Cost or grounding-rate widgets

### 4.2 The Docket
**Role:** Case list and creation.

**Must-Have:**
- Docket Entries (searchable list: open / closed / archived)
- Open a Matter (create flow — jurisdiction + court first)
- Matter Status badge
- Search the Docket
- Case membership roles + full audit
- Case-creation notice

**Later:**
- Retrieve from Court (import)
- Tags / folders / structure templates (structure only)

### 4.3 The Wire
**Role:** AI Legal Team orchestration, conversation, configuration, telemetry.

**Must-Have (P0):**
- Counsel Roster
- Wire Feed (conversation area)
- Case Citations / citation pills
- Brief Board (context panel)
- Counsel Brief (agent config modal)
- Notice of AI Assistance (disclaimer strip)
- Agent manifests, permission ceilings, model gateway, orchestration, result envelopes

**Later (P2–P3):**
- Appoint Counsel (custom agent creator)
- Session Transcript
- Full Bench View (multi-agent)

### 4.4 Law Library

#### Stacks (Research)
**Must-Have (P1):**
- Search the Stacks
- Volume Cards
- Open Volume (authority detail)
- Research Brief (AI synthesis with inline citations)
- Jurisdiction Filter + Source Type filter
- Case Research (case-scoped)
- Grounding guard, citation objects, “what we could not verify”

**Later:**
- Marked Volumes, Citation Web, Case Folders, Prior Research, Precedent Finder, Issue Spotter, Research Memo

#### Record Room (Documents)
**Must-Have (P0–P1):**
- Filing Table
- File a Record (upload zone)
- Record Preview
- Filing Cabinet (filters)
- Extraction Status + Cleared for Filing
- Immutable originals + version lineage
- Draft Desk (basic state machine)

**Document type labels (carried forward):** Charging Instrument, Officer’s Report, Order of Court, Filed Motion, Working Draft, Exhibit, Court Transcript

#### Chronology
**Must-Have (P0):**
- Chronology canvas
- Case Events (nodes)
- Event Record (detail drawer)
- Log Event (add modal)
- Proposed-by-AI vs confirmed distinction
- Event type vocabulary from original blueprint

**Later:** Print Chronology, Date Conflict Alert, zoom/diffs, accessible table view

#### Evidence Locker
**Near-term (P1):** User-uploaded evidence only  
- Evidence Log (card grid)
- Exhibit Type badges
- Link to Timeline
- Chain of Custody notes (user-entered)
- AI may organize/suggest only — never assert authenticity or admissibility

**Explicitly Later (P3):** Any court-sourced evidence, official chain-of-custody systems, or evidence viewing that requires court permission/connectors.

#### Audits & Memos
**Must-Have (P1):**
- Rights Audit
- Plea Analysis (structure only — never recommend or predict)

**Later:**
- Mitigation Memo

### 4.5 Court Watch & Tasks
**Must-Have (P1):**
- Deadline Engine (deterministic, fully explainable, version-pinned, honest rule_not_found)
- Action Items / Task cards
- Motion Board (Kanban)
- Deadline Notices
- Upcoming Appearances (basic)
- Court Data Sources status (verified or “capability not verified”)

**Later:**
- Live Docket Sync
- Hearing Prep Kit polish
- Court Calendar
- Counsel Recommendations (AI-generated tasks)

### 4.6 Chambers (Later — P3)
New section relative to original blueprint.  
- Conference Room (per-party: Judge / Prosecutor / Clerk)
- Case Updates feed
- Chambers Record (correspondence log)

**Split rule:** Court Watch = raw data feed. Chambers = human-readable conversation and updates. Both gated behind verified connectors where applicable.

### 4.7 Law Academy (Later — P3)
- Course Catalog
- Rules & Procedure tracks
- Lessons / Moot Practice
- Transcript of Study (progress only — no real certificates)

### 4.8 Counsel Directory (Placement TBD — currently unplaced)
Neutral search only.  
Must follow original rules: filters only, per-field provenance, sponsored separation, no ranking, no AI recommendation, excluded from agent corpora, non-dismissible notice, per-jurisdiction UPL review before enablement.

---

## 5. Core Invariants (Carried Forward Unchanged)

These remain non-negotiable and are enforced in code, not merely documented:

- Every AI output is a typed envelope with labeling, grounding, confidence, and provenance.
- No fabricated authority — grounding guard is code-enforced.
- No external legal action without per-action, human, payload-bound, single-use approval + fresh MFA.
- AI never transitions documents to user_approved / final / filed_externally.
- AI-proposed timeline events and issues remain unverified until human confirmation.
- Capability-not-verified is the honest default for undeclared connectors or features.
- Row-level security + server-side authorization (deny by default).
- Append-only, hash-chained audit.
- Model gateway is the single seam to providers.
- Immutable originals; derived work is new versions.
- Jurisdiction is first-class and attached at case creation.
- Reading level (Plain / Standard / Detailed) applied consistently.
- Never claim to be a lawyer, never create attorney–client relationship, never rank attorneys, never predict outcomes as fact.

---

## 6. Realistic Implementation Guidance (New)

For a new/upcoming product:

**High probability (build first):**  
P0 items + user-controlled surfaces (documents, timeline, tasks, basic research over owned corpus, structure-only analysis agents, deterministic deadlines for priority jurisdictions).

**Medium probability:**  
Quality research over continuously refreshed public corpora, neutral counsel directory, user-uploaded Evidence Locker, modest agent team expansion.

**Low probability / long-horizon:**  
Live verified court connectors, Chambers-style official communication, court-sourced evidence, any write-side court interaction, broad multi-jurisdiction rule maintenance at high freshness.

**Evidence Locker policy:**  
Ship user-uploaded organization in P1. Treat anything requiring court systems or official evidence access as P3 and capability-not-verified until formal relationships and technical verification exist.

---

## 7. MVP Acceptance (Updated)

**MVP is complete when:**
- Cross-tenant access is impossible and proven by automated tests.
- Audit log is append-only and verifiable.
- A user can create a case (with jurisdiction), upload documents (immutable + versioned), build a chronology (AI proposes, human confirms), and receive typed, grounded envelopes from at least one seed agent.
- Deadline Engine works for the initial jurisdiction set with full explainability.
- All required notices are versioned and acknowledged.
- CI gates (isolation, RLS, grounding, security, migrations) block merge on failure.

---

## 8. Document Control

- Original source: Chain_of_Command_Full_App_Blueprint.pdf (24 pages)
- This revision integrates: themed IA (The Wire, Command Center, Law Library tabs, etc.), master task list prioritization, realism assessment, and explicit later-stage treatment of Evidence Locker (court-sourced) and live court integrations.
- All original Must-Have guardrails, labeling rules, disclosure placements, and ethical constraints remain in force.
- Gaps originally flagged (no numeric probability bands, no training program, no filing automation) remain gaps — not invented features.

**Next living updates should be driven by the Master Task List (P0 → P3) and capability-not-verified register.**

---

*End of Revised Blueprint v2.1*
