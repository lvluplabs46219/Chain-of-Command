# Acquit.ai — "Sovereign" Design System (Black & Gold)

This is the canonical layout + color spec for the Acquit.ai case workspace.
It documents what's **already implemented** in
`src/components/mockups/acquit-case-workspace/` and fills in the pieces
needed to make it a consistent, production-grade Web3-style system.

Tokens live in `src/index.css` under `:root` (prefixed `--sov-*`) and as
utility classes (`.sov-panel`, `.sov-btn-gold`, etc.) in the `@layer utilities`
block — use those instead of re-typing raw hex/rgba strings in new screens.

---

## 1. Why Black & Gold (not deep blue)

Web3-style dark UIs generally work in one of two directions:

- **Black & Gold** — "sovereign vault / private ledger" feel. Warm, premium,
  authoritative. Reads as *trust + gravity* — fitting for a legal product
  where the user is scared/stressed and needs to feel protected.
- **Deep Blue / Indigo** — "network / protocol" feel (Coinbase, Base, most
  DeFi dashboards). Reads as *tech + infrastructure*.

**Recommendation: Black & Gold**, because:
1. It's already ~95% implemented across all 12 existing screens (190+ uses
   of `#D4AF37`, consistent `#0A0A0A` base, emerald secondary, glass panels,
   gold glow shadows, serif headings).
2. It differentiates from the sea of blue Web3/AI products.
3. Gold-on-black reads as "your case is secured in a vault," which matches
   the "Enclave Secured" messaging already in the sidebar.

Deep blue is kept as a **secondary/future theme** (`--sov-blue`,
`--sov-indigo` tokens exist) for a potential "Enterprise/Pro" tier toggle —
not mixed into the primary experience.

---

## 2. Color Palette

| Role | Token | Hex | Notes |
|---|---|---|---|
| Base background | `--sov-void` | `#0A0A0A` | App shell, sidebar, header |
| Raised surface | `--sov-ink` | `#0E0E0E` | Modals, popovers |
| Alt surface | `--sov-ink-2` | `#111214` | Nested cards |
| **Primary / Brand** | `--sov-gold` | `#D4AF37` | CTAs, active nav, glow, accents |
| Gold soft | `--sov-gold-soft` | `#EFE6D0` | Text on light/white buttons |
| Gold muted | `--sov-gold-muted` | `#c49f27` | Pressed state |
| **Secondary** | `--sov-emerald` | `#174E48` | Secondary buttons, agent chat bubbles |
| Emerald bright | `--sov-emerald-bright` | `#1f665e` | Emerald hover |
| Success | `--sov-success` | `#34D399` | Verified / completed badges |
| Danger | `--sov-danger` | `#FB7185` | Uncertainty / error badges |
| Border (hairline) | — | `white/10` | All glass panel borders |
| Text muted | — | `white/40–60` | Secondary/tertiary copy |

Glow shadows (also tokenized):
```
--sov-glow-gold:      0 0 20px rgba(212,175,55,0.35)
--sov-glow-gold-sm:   0 0 12px rgba(212,175,55,0.25)
--sov-glow-emerald:   0 4px 20px rgba(23,78,72,0.4)
```

## 3. Typography

| Role | Font | Tailwind class | Used for |
|---|---|---|---|
| Display / headings | **Playfair Display** | `font-serif` | Page titles, section headings (`h2`, hero numbers) |
| Body / UI | **Inter** | `font-sans` | Paragraph copy, chat text, form fields |
| Data / labels | **JetBrains Mono** | `font-mono` | Case numbers, hashes, timestamps, badges, nav labels |

All three are already loaded via Google Fonts `<link>` in `index.html`;
`src/index.css` now maps them to the `--font-serif/--font-sans/--font-mono`
CSS variables so `font-serif`/`font-mono` utility classes resolve correctly
(previously they fell back to Georgia/Menlo).

Sizing conventions seen across screens:
- Eyebrow labels: `text-[9-10px] font-bold tracking-widest uppercase text-[#D4AF37]`
- Section titles: `font-serif text-[22-28px] text-white`
- Body copy: `text-xs leading-[1.6] text-white/70`

## 4. Core Surface Patterns

**Glass panel** (`.sov-panel`) — the base card everywhere:
```css
background: rgba(255,255,255,0.03);
border: 1px solid rgba(255,255,255,0.10);
border-radius: 18px;
backdrop-filter: blur(24px);
```

**Buttons** (3 tiers, all pill-shaped `rounded-full`, glow on hover):
- `.sov-btn-gold` — primary action (solid gold, black text)
- `.sov-btn-emerald` — secondary action (emerald fill, gold text)
- `.sov-btn-outline` — tertiary / ghost (white/5 fill, white/20 border)

**Selection state** (`.sov-selected`) — gold ring + soft glow, used for
active carousel slide, selected agent, selected nav item.

**Live indicator** (`.sov-live-dot`) — pulsing gold ping, used for
"upcoming deadline," "active" badges, notification dots.

## 5. Full App Layout Map

```
┌─────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (280px, fixed, collapsible on mobile)                       │
│  ── Brand mark (gold glow "A" mark + ACQUIT.AI / SOVEREIGN OS)      │
│  ── WORKSPACE                                                       │
│      Case overview · AI Lab · Google Workspace · Find an attorney   │
│      Timeline · Documents · Filing center · Acquit Academy          │
│  ── INTELLIGENCE                                                     │
│      AI legal team · Law library                                    │
│  ── Enclave Secured trust panel (glass, gold shield icon)            │
│  ── User strip (avatar, name, role, overflow menu)                  │
├─────────────────────────────────────────────────────────────────────┤
│ MAIN                                                                 │
│  Header: breadcrumb (CASES › SECTION) · docket badge · search ·      │
│          notification bell (gold glow dot)                          │
│                                                                       │
│  Sub-nav tabs: Overview · Timeline · Documents · Court activity      │
│               (gold underline + glow on active tab)                  │
│                                                                       │
│  ROUTES (rendered by activeNav / activeTab state):                  │
│   • Case overview  → deadline hero card + AI assessment +            │
│                       legal team panel + evidence summary            │
│   • AI Lab          → 7-agent selector strip (horizontal scroll) +   │
│                       EvidenceCarousel + timeline strip +            │
│                       Simulation / Team Chat tabs                    │
│   • Timeline         → CaseTimeline (vertical/branching)             │
│   • Documents        → SovereignCylinder (full-bleed 3D doc ring)    │
│   • Filing center    → FilingCenter (motion drafts, human-approval)  │
│   • Find an attorney → AttorneyDirectory (filterable card grid)      │
│   • Law library      → LawLibraryExplorer + RagCitationViewer        │
│   • Acquit Academy   → AcquitAcademy (course carousel)               │
│   • Google Workspace → GoogleWorkspaceIntegration                    │
│                                                                       │
│  Footer notice: disclaimer + "Plain English" toggle                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Carousels (Web3 "infinite feed" language) — all Embla-based

| Carousel | Component | Behavior |
|---|---|---|
| Evidence gallery | `EvidenceCarousel.tsx` | Autoplay 6s, loop, gold-glow on selected card, inspect modal w/ SHA-256 |
| Document vault | `SovereignCylinder.tsx` | 3D rotating cylinder of filings, drag-to-rotate, IPFS-style CID chips |
| Case progression | inside `AILab.tsx` | 4-up static strip (arrest → hearing → discovery → trial), gold ring on active |
| Attorney cards | `AttorneyDirectory.tsx` | Filterable grid, could upgrade to `Carousel` primitive for mobile swipe |
| Academy courses | `AcquitAcademy.tsx` | Course card carousel |
| Law authorities | `LawLibraryExplorer.tsx` | Statute/case card carousel with cite-to-case action |

Base primitive: `src/components/ui/carousel.tsx` (shadcn wrapper over
`embla-carousel-react`). `EvidenceCarousel` bypasses it and calls
`useEmblaCarousel` + `embla-carousel-autoplay` directly for more control
over per-slide styling — that's the right pattern to copy for new carousels
that need custom slide chrome (glow rings, status badges, thumbnails).

## 6. Motion / Glow Rules

- Hover on any button: `translateY(-1px)` + glow shadow fade-in (150ms).
- Active/selected card: persistent glow ring, slight `-translate-y-0.5`.
- Deadline / live status: pulsing ring (`animate-ping`) behind a solid dot.
- Modals: `animate-in fade-in duration-200` + backdrop blur.
- Streaming AI text: blinking gold caret (`animate-pulse` bar).

## 7. Open Gaps / Next Steps

1. `AttorneyDirectory` and `AcquitAcademy` use flex/grid card lists, not the
   shared `Carousel` primitive — consider migrating to `ui/carousel.tsx` +
   `CarouselItem` for consistent swipe/keyboard nav + built-in prev/next glow
   buttons instead of bespoke scroll containers.
2. Some screens use raw hex (`#D4AF37`, `#174E48`) inline; new components
   should reference the CSS vars (`var(--sov-gold)`) or the new utility
   classes (`.sov-btn-gold`, `.sov-panel`) added in `src/index.css` so a
   future rebrand (e.g. the deep-blue Pro theme) is a one-file change.
3. `--radius` is currently `.5rem` globally (shadcn default) while the
   Sovereign screens hand-round everything to `12–18px` via arbitrary
   values (`rounded-[14px]`, `rounded-[18px]`) — worth promoting `14px`/
   `18px` to named radius tokens (`--radius-sov-sm` / `--radius-sov-lg`) so
   card rounding is consistent without hunting arbitrary values.
