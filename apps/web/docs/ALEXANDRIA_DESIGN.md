# Alexandria — High-End Editorial

**North Star:** *The Digital Curator*  
A scholarly, premium reading experience. Dense information made effortless through serif authority and generous whitespace.

## When to use

| Surface | Theme |
|---------|--------|
| Law Library, authorities, citation reader, long-form research | **Alexandria** |
| Command Center, Docket, Chambers, Evidence Locker | **Sovereign** (black & gold) |

Do not mix themes in one view. Scope with `data-theme="alexandria"` on the page root.

## Colors

| Role | Token | Value |
|------|--------|--------|
| Primary | `--alex-primary` | `#094cb2` — links, primary actions, focus only |
| Primary container | `--alex-primary-container` | `#3b6fd4` — gradient end |
| Tertiary (archival gold) | `--alex-tertiary` | `#6d5e00` — highlights, badges |
| Surface ladder | `--alex-surface-dim` → `--alex-surface-container-lowest` | hierarchy without borders |

**No-Line Rule:** Never use solid 1px borders. Boundaries = background shifts between surface tiers.  
**Ghost Border** (if unavoidable): `outline_variant` at 15% → `--alex-ghost-border`.  
**Glass menus:** 80% opacity surface + 20px backdrop-blur (`.alex-glass`).  
**Primary CTA:** gradient `primary` → `primary_container` (`.alex-btn-primary`).

## Typography

| Role | Font | Class |
|------|------|--------|
| Headlines / narrative | **Noto Serif** | `.alex-headline` |
| Body / dense text | **Inter** | `.alex-body` |
| Labels / metadata | **Public Sans** | `.alex-label` |

Load fonts once in the Alexandria shell (Google Fonts or self-host):

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Serif:wght@400;600;700&family=Public+Sans:wght@500;600;700&display=swap" rel="stylesheet" />
```

## Elevation

- Depth via **tonal layering** (stack surface tokens), not heavy drop shadows.
- Modals: 24–40px blur, 4–6% opacity, tinted `on_surface` → `--alex-shadow-modal`.
- Minimum corner radius: `sm` (`--alex-radius-sm`). Never sharp corners.

## Components

| Component | Pattern |
|-----------|---------|
| Primary button | Gradient fill, white text |
| Secondary | surface-high bg + primary text |
| Tertiary | text only + hover underline |
| Cards | No dividers; spacing or alternating surfaces (`.alex-card` / `.alex-card-alt`) |
| Inputs | White/lowest surface, ghost border, focus = primary outline |

## Rules

1. Whitespace is structure — prefer padding/gap over lines.
2. Serif for narrative and titles; Inter for dense procedural text.
3. **One primary action per view.**
4. Primary blue only for links, focus, and the single primary CTA — not decorative chrome.
5. Archival gold badges for “verified authority,” “cited,” “archive” states.

## Implementation

```tsx
// Page root
<main data-theme="alexandria" className="alex-shell min-h-screen p-8">
  <p className="alex-label mb-2">Law Library</p>
  <h1 className="alex-headline text-3xl mb-6">Authorities</h1>
  <article className="alex-card alex-body max-w-prose">…</article>
  <button type="button" className="alex-btn-primary mt-6">Cite to case</button>
</main>
```

Import tokens once (e.g. in layout or law-library route):

```ts
import "../styles/alexandria-tokens.css";
```

## Relation to Sovereign

Sovereign (`DESIGN_SYSTEM.md`) remains the OS chrome for case work. Alexandria is the **reading room** — lighter, editorial, citation-first. Shared product, two deliberate modes.
