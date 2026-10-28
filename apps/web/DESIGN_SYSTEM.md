# Acquit.ai / Chain of Command — Design System (implementation notes)

**Authoritative design sources (read these first):**

| Document | Role |
|---|---|
| [`docs/design/DESIGN.md`](../../docs/design/DESIGN.md) | Candy — Playful & Vibrant palette, type, shape, motion |
| [`docs/design/DIRECTION.md`](../../docs/design/DIRECTION.md) | Platform-of-places architecture + Candy-everywhere governance |
| [`packages/shared/src/candy-tokens.css`](../../packages/shared/src/candy-tokens.css) | Single token source (`@chain-of-command/shared/candy-tokens.css`) |
| [`apps/web/src/index.css`](./src/index.css) | App wiring: Candy tokens + legacy `--sov-*` aliases remapped to Candy |

Where this file or any mockup conflicts with those sources, **those sources win**.

---

## 1. Platform identity: Candy everywhere

The entire product uses the **Candy — Joyful Pop** theme:

- Primary: hot pink (`#af0a78` / accent `#e040a0`)
- Secondary: purple (`#744aa2` / `#7c52aa`)
- Tertiary: sky blue (`#006388` / `#0096cc`)
- Surfaces: light pink-lavender family (`#fff7fb`, `#fde7ff`, …)
- Body type: **DM Sans** at 16px base
- Shape: pills on buttons/badges; 16–20px radii on cards; tinted shadows
- Motion: bouncy ease-out hover (`scale(1.03)`)

There is **no per-place color identity**. Places (Law School, Library, Draft Desk, Filing Center, Command Center) differentiate by layout, display typography, and metaphor — never by introducing new hex values.

---

## 2. Governance (enforced in review)

1. **No new hex values** in components. Use `var(--candy-*)` or Tailwind utilities mapped from Candy tokens.
2. **One token source:** `packages/shared/src/candy-tokens.css`. Palette changes happen only there (+ `docs/design/DESIGN.md`).
3. **Legacy Sovereign classes** (`.sov-panel`, `.sov-btn-gold`, `--sov-gold`, etc.) remain for existing markup but are **remapped to Candy** in `src/index.css`. Do not restore black/gold as a parallel theme.
4. Empyrean (separate app) must import the same `candy-tokens.css` so the agent console matches the platform brand.

---

## 3. Places (route subtrees under `apps/web`)

| Place | Intended route | Metaphor |
|---|---|---|
| Draft Desk | `/desk` or `/draft-desk` | Hybrid editor (VS Code × Office × Acrobat × Lexis) |
| Law Library | `/library` | Reading room; every AI claim resolves to a shelf-able source |
| Law School | `/school` | Campus: lectures, moot court, exams, registrar |
| Filing Center | `/filing` | State machine: draft → validate → submit → ACK → index |
| Command Center | `/docket` + workspace | Case workspace, timeline, tasks |
| Empyrean | separate deployment | Agent ops console |

Ship order: **Draft Desk → Library → School** (each prior place supplies infrastructure the next consumes).

---

## 4. Implementation map (current)

- Tokens + light/dark: `packages/shared/src/candy-tokens.css`
- App CSS entry: `apps/web/src/index.css` (Candy + remapped `--sov-*` aliases + `.candy-*` / `.sov-*` utilities)
- Historical mockups under `components/mockups/` may still contain raw black/gold classes; new screens must not copy those hexes — use Candy tokens or the remapped utilities.

---

## 5. Historical note (Sovereign black & gold)

An earlier "Sovereign" black-and-gold Web3 register existed in mockups and this file. It is **retired as the product skin**. References to `#D4AF37`, `#0A0A0A`, and "vault" gold are legacy only; they are overridden at the token layer so existing components render in Candy without a full rewrite.
