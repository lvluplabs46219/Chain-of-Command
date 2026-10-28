# DESIGN DIRECTION — Chain of Command Platform

**Status:** Authoritative. This document and `docs/design/DESIGN.md` govern all UI work.
Where an older document, mockup, or theme (including the former dark courtroom gold/charcoal register) conflicts with these two files, these files win.

## 1. The platform is a set of places

Chain of Command is not one application with feature pages. It is a platform of
distinct, immersive **places**, each with its own spatial metaphor, layout, and
interaction model, united by one backend, one auth, one database, and one design
token system.

| Place | Route subtree | Metaphor |
|---|---|---|
| The Law School | `/school` | Online law school campus: lecture halls, moot court, exam rooms, registrar |
| The Law Library | `/library` | Reading room: catalog desks, stacks, reading table, citation-checking desk |
| The Draft Desk | `/desk` | Hybrid editor: VS Code shell × Office content model × Adobe document pane × LexisNexis authority layer |
| The Filing Center | `/filing` | Document state machine surface (draft → validation → submission → court ACK → indexed) |
| Command Center | `/docket` and workspace routes | Case workspace, docket, timeline, tasks |
| Empyrean (separate app) | own deployment | Agent operations console: Telegram-style chat, DAG views, Three.js Nexus 3D |

Each place gets its own layout, navigation chrome, display typography, and
texture. Places are built as their own route subtree under `apps/web` with a
dedicated `layout.tsx`, sharing only session context and component primitives.

## 2. ONE color system: Candy everywhere

The entire platform — every place, every face, every app — uses the **Candy —
Playful & Vibrant** theme defined in `docs/design/DESIGN.md`. There is no
per-place color identity. The Candy palette is the platform's skin.

- Tokens live in exactly one file: `packages/shared/src/candy-tokens.css`
  (exported as `@chain-of-command/shared/candy-tokens.css`).
- Every place and every app consumes that file. Nothing defines its own colors.
- Light and dark modes are both first-class (`[data-theme]`), per DESIGN.md.
- Empyrean imports the same tokens: the agent console is a distinct app but the
  same brand.

## 3. Governance rules (enforced in review)

1. **No new hex values.** No place, component, or app may introduce a color
   outside the Candy tokens. Identity comes from typography, layout, and
   texture — never from new colors. Reviewers must reject PRs that add raw
   color literals in components.
2. **One token source.** Palette changes happen only in
   `candy-tokens.css` + `docs/design/DESIGN.md`, so every face changes
   simultaneously. Duplicate token definitions are a defect.
3. **Per-place variation is allowed only in:** display typefaces (e.g. an
   academic face for the Law School, a slab serif for the Library), layout,
   spatial metaphor, illustration, and micro-copy.
4. **Candy shape and motion rules apply everywhere:** pill buttons and badges,
   16-20px card radii, tinted shadows (15-20% opacity), bouncy ease-out hover
   microinteractions (`scale(1.03)`), DM Sans body text, 16px base size.

## 4. Wiring the tokens

Tailwind v4 (`apps/web`):

```css
/* apps/web/src/app/globals.css */
@import "@chain-of-command/shared/candy-tokens.css";
@theme {
  --color-surface: var(--candy-surface);
  --color-card: var(--candy-card-bg);
  --color-primary: var(--candy-primary);
  --color-secondary: var(--candy-secondary);
  --color-tertiary: var(--candy-tertiary);
  --color-on-surface: var(--candy-on-surface);
  --color-background: var(--candy-background);
  --font-display: var(--font-candy);
  --font-mono: var(--font-mono);
  --radius-pill: var(--candy-radius-full);
}
```

Non-Tailwind surfaces (Empyrean dashboard): import the same CSS file and set
`data-theme` on `<html>`; all `--candy-*` variables resolve identically.

## 5. Empyrean is a separate face, not a subpage

Empyrean (`lvluplabs46219/empyrean`) is the agent playground and AI legal team
console. It deploys as its own application (own port/subdomain), keeps its own
shell and UX, and shares with Chain of Command: the agent kernel, the database,
the auth (same Supabase JWTs), and — now — the Candy token system. It is one
product with many faces; presentation is deliberately split, the spine never
forks.

## 6. Ship order

1. Draft Desk (core daily utility) — first.
2. Law Library (grounds every citation the platform produces).
3. Law School (content-heavy; launches last).

Every AI-generated statement in every place must resolve to a Library source —
this is the platform-wide grounding contract and it overrides any scheduling
convenience.
