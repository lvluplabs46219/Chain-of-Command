# Chain of Command — Design Direction & Platform Architecture

> **MANDATORY ARCHITECTURAL DIRECTIVE FOR ALL DEVELOPERS & AGENTS**  
> Chain of Command is not a generic chatbot or a flat SaaS dashboard.  
> It is an immersive **Platform of Places**, built upon **One Invisible Spine**, unified under a single **Candy Design Theme ("Joyful Pop")**.
>
> **Living IA source of truth:** `docs/CHAIN_OF_COMMAND_FULL_APP_BLUEPRINT_REVISED.md` (v2.1)

---

## 1. The Core Product Doctrine

```
                        THE USER
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
  CASE WORKSPACE                       PLATFORM OF PLACES
  (Command Center & The Docket)        (Law Library, The Wire, Court Watch…)
       │                                       │
       └───────────────────┬───────────────────┘
                           ▼
                  ONE INVISIBLE SPINE
  ┌────────────────────────────────────────────────────────┐
  │ • Supabase JWT Auth + Multi-Tenant RLS + ABAC          │
  │ • PostgreSQL + pgvector Embeddings                     │
  │ • Agent Kernel & Multi-Provider Model Gateway          │
  │ • Document Pipeline: Draft → Review → Human ACK        │
  │ • Cryptographic Hash-Chained Audit Trail               │
  │ • Typed Result Envelopes (labeling + grounding)        │
  └────────────────────────────────────────────────────────┘
```

The user experiences Chain of Command as a constellation of dedicated, immersive **places**—each with its own functional and spatial metaphor—anchored by a single, secure engineering spine.

---

## 2. The Unified Design Constraint: Candy Everywhere

**Rule:** Every single place, module, and face across Chain of Command shares the **exact same Candy design palette**. No place may invent a separate color system.

| Layer | Shared or Varied | Specification |
| :--- | :--- | :--- |
| **Color Palette** | **Shared — Identical Everywhere** | Primary Hot Pink (`#af0a78`/`#e040a0`), Purple (`#744aa2`/`#7c52aa`), Sky Blue (`#006388`/`#0096cc`), Dark Plum text (`#281330`), Light Canvas (`#fff7fb`/`#ffffff`) |
| **Shape Language** | **Shared** | Pill-shaped badges and buttons (`rounded-full`), generous card curves (`16px–24px`), zero sharp corners |
| **Shadows & Motion** | **Shared** | Tinted shadows matching element colors (15–22% opacity), spring/bouncy micro-interactions (`scale(1.02)`) |
| **Typography (Body)** | **Shared** | `DM Sans` for all interface text, labels, and averments; `JetBrains Mono` for dockets, cause numbers, and code |
| **Typography (Display)** | **Varied per place** | Subtle typographic personality (e.g., academic slab in Law Library, geometric in Draft Desk) |
| **Spatial Metaphor** | **Varied per place** | Reading room vs. Campus buildings vs. Multi-pane IDE editor |

---

## 3. The Places & Their Metaphors (Aligned to Blueprint v2.1)

### 1. Command Center (`/` or case overview)
* **Metaphor:** The Master Case Operating Console.
* **Role:** Cross-case + case overview, Brief Stats, Charge Sheet, Chronology Rail, Team Panel, Court Log, Urgent Notices.
* **Key Experience:** Total situational awareness. Clean, reassuring, organized. Links out to full Chronology and The Wire.

### 2. The Docket (`/docket`)
* **Metaphor:** The Matter Registry.
* **Role:** Case list (open/closed/archived), Open a Matter (jurisdiction + court first), Matter Status, membership roles.
* **Key Experience:** Strict case scoping and audited membership from the first click.

### 3. The Wire (`/wire` or case AI surface)
* **Metaphor:** The AI Legal Team Operations Channel.
* **Role:** Counsel Roster, Wire Feed, Brief Board, Counsel Brief (agent config), Notice of AI Assistance, Session Transcript (later).
* **Key Experience:** Permissioned agents, typed result envelopes, grounding labels, human-in-the-loop. Replaces the old “Chambers = AI chat” naming collision.

### 4. Law Library (`/library`)
* **Metaphor:** The Grand Legal Reading Room + Workrooms.
* **Internal Tabs:**
  * **Stacks** — Research engine, Volume Cards, Research Brief, grounding guard
  * **Record Room** — Filing Table, upload, immutable originals, Draft Desk
  * **Chronology** — Proposed-vs-confirmed timeline
  * **Evidence Locker** — User-uploaded evidence only (near-term)
  * **Audits & Memos** — Rights Audit, Plea Analysis (structure only)
* **Key Experience:** Every AI legal claim must resolve to a verifiable volume or be labeled ungrounded.

### 5. Court Watch & Tasks (`/court-watch` or equivalent)
* **Metaphor:** The Docket Watch Desk + Motion Board.
* **Role:** Deadline Engine (deterministic + explainable), Action Items, Motion Board, basic docket feed, connector status (“verified” or “capability not verified”).
* **Key Experience:** Honest about what the system can and cannot read from courts.

### 6. Chambers (Later — P3)
* **Metaphor:** Court Communication Rooms (Judge / Prosecutor / Clerk).
* **Role:** Human-readable case updates and correspondence. Distinct from The Wire (AI team).
* **Status:** Explicitly later; gated by verified connectors and capability-not-verified register.

### 7. Law Academy (Later — P3)
* **Metaphor:** The Virtual Legal Campus.
* **Role:** Course Catalog, Rules & Procedure, Lessons / Moot Practice, Transcript of Study (progress only — no real certificates).
* **Status:** Later phase.

### 8. Counsel Directory (Placement TBD)
* **Metaphor:** Neutral Attorney Registry.
* **Rules (non-negotiable):** Filters only, per-field provenance, sponsored strip separated and excluded from agent corpora, no ranking, no AI recommendation, per-jurisdiction UPL review before enablement.

### 9. The Wire / Telemetry (supporting)
* **Metaphor:** AI Agent Telemetry & Operations Console.
* **Role:** Model routing, token usage, grounding accuracy, agent runtime inspection. Supports The Wire and admin surfaces.

---

## 4. Token Architecture & Single Source of Truth

All design tokens are defined in:
```
packages/shared/src/candy-tokens.css
```
And imported into the web application via:
```css
/* apps/web/src/index.css */
@import "tailwindcss";
@import "../../packages/shared/src/candy-tokens.css";
```

### Token Reference
```css
/* Primary Colors */
--candy-primary: #af0a78;           /* Deep Hot Pink */
--candy-primary-accent: #e040a0;    /* Bright Vibrant Pink */
--candy-secondary: #744aa2;         /* Royal Purple */
--candy-secondary-accent: #7c52aa;  /* Lavender Purple */
--candy-tertiary: #006388;          /* Ocean Sky Blue */
--candy-tertiary-accent: #0096cc;   /* Electric Cyan Blue */

/* Surfaces & Readable Contrast */
--candy-background: #fff7fb;        /* Soft Candy Tint Canvas */
--candy-card-bg: #ffffff;           /* Crisp White Card Container */
--candy-on-surface: #281330;        /* Deep Readable Plum Text */
--candy-border: #f0d5e2;            /* Soft Pink-Plum Border */

/* Radius & Shadow */
--candy-radius-full: 9999px;        /* Pill Buttons & Badges */
--candy-radius-lg: 1.5rem;          /* 24px Rounded Cards */
--candy-shadow-card: 0 6px 20px rgba(116, 74, 162, 0.08);
--candy-shadow-hover: 0 8px 24px rgba(224, 64, 160, 0.28);
```

---

## 5. Development Rules for Future Engineers

1. **Zero-Pill-Drop Rule:** Buttons and status badges must always be pill-shaped (`rounded-full`). Never create sharp rectangular buttons.
2. **Never Invent Colors:** Do not hardcode arbitrary hex codes in components. Use standard Candy tokens (`#af0a78`, `#e040a0`, `#744aa2`, `#006388`, `#281330`, `#fff7fb`, `#ffffff`).
3. **Tinted Shadows:** Always use tinted shadows matching the component's accent color (e.g. `rgba(224, 64, 160, 0.22)`), never harsh generic black drop-shadows.
4. **Preserve and Enhance:** When expanding any place, retain all existing state persistence (`localStorage`, Supabase) and verify TypeScript compilation.
5. **Pro Se Boundaries:** Never allow AI agents to autonomously submit or file documents. All external actions remain strictly human-controlled with payload-bound approval + fresh MFA.
6. **Capability-not-verified:** External court connectors and evidence systems default to honest “capability not verified” until formally verified. Do not fake integrations.
7. **IA Source of Truth:** Navigation labels, tab structure, and priority (P0–P3) are defined in `docs/CHAIN_OF_COMMAND_FULL_APP_BLUEPRINT_REVISED.md`. Update that document before inventing new places.
