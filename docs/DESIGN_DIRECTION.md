# Chain of Command — Design Direction & Platform Architecture

> **MANDATORY ARCHITECTURAL DIRECTIVE FOR ALL DEVELOPERS & AGENTS**  
> Chain of Command is not a generic chatbot or a flat SaaS dashboard.  
> It is an immersive **Platform of Places**, built upon **One Invisible Spine**, unified under a single **Candy Design Theme ("Joyful Pop")**.

---

## 1. The Core Product Doctrine

```
                        THE USER
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
  CASE WORKSPACE                       PLATFORM OF PLACES
  (Command Center & Docket)            (Law School, Library, Draft Desk, etc.)
       │                                       │
       └───────────────────┬───────────────────┘
                           ▼
                  ONE INVISIBLE SPINE
  ┌────────────────────────────────────────────────────────┐
  │ • Supabase / Firebase JWT Auth + Multi-Tenant RLS      │
  │ • PostgreSQL + pgvector Embeddings                     │
  │ • Agent Kernel & Multi-Provider Model Gateway          │
  │ • Document Pipeline: Draft → Review → ACK → Indexed   │
  │ • Cryptographic Hash-Chained Audit Trail               │
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

## 3. The Places & Their Metaphors

### 1. The Command Center & The Docket (`/` and `/docket`)
* **Metaphor:** The Master Case Operating Console.
* **Role:** High-level case overview, speedy trial countdowns, upcoming deadlines, charge decomposition, and Chronological Case Summary (CCS).
* **Key Experience:** Total situational awareness for the self-represented litigant. Clean, reassuring, organized.

### 2. The Draft Desk (`/draft-desk`)
* **Metaphor:** The Hybrid Legal IDE (**VS Code × Office × Adobe Acrobat × LexisNexis**).
* **Architecture:**
  * **The Shell (VS Code):** Tabs, split panes, command palette (`Cmd+K`), keyboard-first navigation, and active draft states.
  * **The Content Model (Office):** Formatted legal pleading paper, numbered averments, prayers for relief, and certificate of service blocks.
  * **The Document Pane (Adobe):** Live PDF rendering, pro se clerk copy previews, line numbers, and pro se verification checklists.
  * **The Authority Layer (LexisNexis):** Cite-as-you-write auto-binding with the active matter's cause number, court name, judge, and verified legal authorities.
* **Pro Se Safety Boundary:** Every pleading includes the mandatory human-review header:
  `[PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW & SIGNATURE PRIOR TO FILING]`.

### 3. The Law Library (`/library`)
* **Metaphor:** The Grand Legal Reading Room.
* **Architecture:** Catalog desks, stacks organized by jurisdiction and topic, reading tables where retrieved statutes and appellate opinions accumulate as shelf-able, physical-feeling volumes.
* **Key Experience:** Shepardizing, good-law indicators, pinpoint citations, and direct integration with CourtListener. Every AI claim in any other place must resolve to a verifiable volume on these shelves.

### 4. The Law School (`/school`)
* **Metaphor:** The Virtual Legal Campus.
* **Architecture:**
  * **Lecture Halls:** Procedural walk-throughs, plain-language legal education modules, and rights breakdown.
  * **The Moot Court:** Interactive argument practice and objection simulation against AI judicial panels.
  * **Examination Rooms:** Self-assessment quizzes with model answers and statutory citations.
  * **Study Halls:** Socratic dialogue with specialized AI legal workers.
  * **Registrar:** Litigant skills transcript, progress tracking, and readiness certifications.

### 5. The Agent Directory & AI Talent Marketplace (`/directory`)
* **Metaphor:** The Legal Worker & Skills Exchange.
* **Architecture:**
  * **AI Legal Workers & Skills:** 14+ specialized AI agents with certified operational skills (Terry stop audits, Brady demand drafting, cross-examination question generation, IPTG parenting schedules).
  * **Hire & Team Assembly:** Users can hire specialists with one click, persistently binding them to their active case and making them available in Chambers.
  * **Neutral Bar Directory:** Verified state bar attorney registry maintaining strict neutrality (no paid ranking, scoring, or recommendations per Rule 18/19).

### 6. Chambers (`/chambers`)
* **Metaphor:** The AI Legal Team Strategy Room.
* **Architecture:** Private multi-agent consultation room where hired AI specialists collaborate on docket analysis, evidence evaluation, and hearing prep with explicit context boundaries.

### 7. The Filing Center (`/filing`)
* **Metaphor:** The Procedural State Machine.
* **Architecture:** Clean, zero-distraction workflow: Draft → Human Review & Verification → 3-Copy Assembly → Filing Fee / In Forma Pauperis Waiver → Certificate of Service → Clerk Timestamp Tracking.

### 8. Empyrean (`/empyrean` or dedicated face)
* **Metaphor:** The AI Agent Telemetry & Operations Console.
* **Architecture:** Inspects model routing, token usage, grounding accuracy, and agent runtime execution.

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
4. **Preserve and Enhance:** When expanding any place, retain all existing state persistence (`localStorage`, Supabase, Firestore) and verify TypeScript compilation with `compile_applet`.
5. **Pro Se Boundaries:** Never allow AI agents to autonomously submit or file documents. All actions remain strictly human-controlled.
