# Prototype seed — State v. Sample (Arizona)

**Status:** Applied to Supabase project `othxichdhzdxgtatautb` (Acquit.ai) on 2026-10-05.
**Kind:** Fictional prototype only. Not a real case. Not legal advice.

## Case

| Field | Value |
|-------|-------|
| Matter ID | `a1000000-0000-4000-8000-000000000001` |
| Case number | `CR2025-012345` |
| Title | State v. Sample — Misdemeanor Assault + Aggravated Assault (Wobbler) |
| Court | Maricopa County Superior Court |
| Jurisdiction | US-AZ |
| Status | open |
| Owner user | `eca94b54-67d5-4e4b-8ed0-949379bb457b` |

## Counts

| Entity | Count |
|--------|------:|
| Parties | 3 |
| Charges | 2 |
| Timeline events | 10 |
| Documents | 4 |
| Deadlines | 3 |
| AI agents | 4 |

## Charges

1. **A.R.S. § 13-1203(A)(1)** — Assault (class 1 misdemeanor) — pending  
2. **A.R.S. § 13-1204(A)(2)** — Aggravated assault / deadly weapon or dangerous instrument (class 6 felony wobbler) — pending  

## Timeline (summary)

Arrest → Booking → Citation → Initial appearance → Arraignment → Discovery request → State production → Draft motion (unverified/agent-proposed) → Pretrial conference → Tentative trial week.

## AI team

| Agent | Role | Tier | Boundary |
|-------|------|------|----------|
| Charge Explainer AI | charge_explainer | archangel | Analysis only; cite statutes |
| Case Timeline AI | timeline | prophet | Propose events as unverified |
| Legal Research AI | research | patriarch | Grounded claims only |
| Plea Decision Assistant | plea_assistant | judge | **Structure only — never recommend** |

## Notes

- Seeded into the **existing** Supabase schema (`matters`, `charges`, `timeline_events`, etc.), not a greenfield 77-table rebuild.
- Full Chain of Command breadth tables (tenants, jurisdictions, source_registry, …) remain a Phase 0+ migration item.
- Rotate any database password that was shared in chat.
