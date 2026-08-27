---
name: Lex Operating System
colors:
  surface: '#141313'
  surface-dim: '#141313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353435'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c5c6ca'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8f9194'
  outline-variant: '#44474a'
  surface-tint: '#c6c6c9'
  primary: '#c6c6c9'
  on-primary: '#2f3133'
  primary-container: '#1a1c1e'
  on-primary-container: '#838486'
  inverse-primary: '#5d5e61'
  secondary: '#b5c8df'
  on-secondary: '#203243'
  secondary-container: '#36485b'
  on-secondary-container: '#a4b7cd'
  tertiary: '#cfc5be'
  on-tertiary: '#352f2b'
  tertiary-container: '#201b17'
  on-tertiary-container: '#8b837d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e5'
  primary-fixed-dim: '#c6c6c9'
  on-primary-fixed: '#1a1c1e'
  on-primary-fixed-variant: '#454749'
  secondary-fixed: '#d1e4fb'
  secondary-fixed-dim: '#b5c8df'
  on-secondary-fixed: '#091d2e'
  on-secondary-fixed-variant: '#36485b'
  tertiary-fixed: '#ebe0da'
  tertiary-fixed-dim: '#cfc5be'
  on-tertiary-fixed: '#201b17'
  on-tertiary-fixed-variant: '#4c4641'
  background: '#141313'
  on-background: '#e5e2e1'
  surface-variant: '#353435'
typography:
  display-case:
    fontFamily: Domine
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Domine
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Domine
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
  headline-lg-mobile:
    fontFamily: Domine
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin-safe: 32px
---

## Brand & Style
The design system is engineered for the "War Room" environment—a high-stakes digital ecosystem for legal professionals where clarity, authority, and density are paramount. The personality is institutional yet technologically advanced, moving away from consumer-grade "softness" toward a structured, high-fidelity OS aesthetic.

The style is **Modern Corporate with Brutalist undercurrents**: it utilizes crisp borders, high-contrast surfaces, and an uncompromising grid to evoke the feeling of a "Digital Ledger." The UI should feel like a specialized piece of hardware—tactile, reliable, and "on the record." 

Visual principles:
- **Density over Whitespace:** Information is power; layouts prioritize data throughput and complex document management.
- **Institutional Weight:** Elements feel anchored through the use of heavy borders and deep, authoritative colors.
- **Architectural Hierarchy:** Clear differentiation between "The OS" (the frame) and "The Document" (the content).

## Colors
The palette is rooted in **Slate Black (#1A1C1E)** and **Midnight Blue (#2C3E50)** to establish a serious, low-fatigue environment for long-form review. 

- **Legal Gold (#D4AF37):** Used exclusively for high-level status nodes, primary actions, and institutional seals. It represents the "Gold Standard" of the legal record.
- **Surface Strategy:** The system uses a "Dual Surface" model. The application frame (OS) uses Dark Mode variables, while Document Editors and Affidavits may switch to **Paper White (#F8F9FA)** to mimic the physical reading experience.
- **Functional Accents:** Success, Warning, and Error colors are desaturated to maintain the professional atmosphere, used primarily for docket status and filing deadlines.

## Typography
Typography is the primary vehicle for authority in this design system. 

- **The Serif (Domine):** Used for Case Names, Titles, and Section Headers. It carries the weight of a printed court document.
- **The Sans (Hanken Grotesk):** Used for body copy and interface labels. It is highly legible and neutral.
- **The Mono (JetBrains Mono):** Used for "The Record"—docket numbers, timestamps, metadata, and financial data. It suggests precision and unalterable digital entries.

**Strict Rule:** Never use italics for emphasis in labels; use "Label-Caps" or weight changes to maintain a rigid, structured appearance.

## Layout & Spacing
The layout mimics a **Command Center** with a fixed-grid hierarchy. 

- **Structure:** Use a 12-column grid for the main content area with a persistent 280px sidebar for "Case Navigation."
- **Side Panels:** Utilize "Inspector" panels (right-aligned) for metadata and docket details, allowing for a three-pane view (Nav | Content | Inspector).
- **Density:** Spacing is tight (4px/8px increments) to allow for the display of complex legal information without excessive scrolling. 
- **Reflow:** On Tablet, the "Inspector" panel collapses into a bottom sheet. On Mobile, the sidebar becomes a hamburger-style drawer, and the 12-column grid collapses to a single column with 16px safe margins.

## Elevation & Depth
Depth is signaled through **Tonal Layers and Crisp Borders** rather than shadows. 

- **The Base:** The lowest layer is the background (Slate Black).
- **Panels & Modules:** Use a 1px solid border (#2C3E50) to define areas. Avoid soft shadows; use a "hard shadow" (2px offset, 0 blur) in Legal Gold only for active/selected items.
- **Active State:** The active window or document uses a subtle inner-glow or a slightly lighter surface tint (#25282C) to appear "lifted."
- **Overlays:** Modals should have a thick 2px border and a dark, 80% opacity backdrop to maintain focus on the "War Room" intensity.

## Shapes
This design system utilizes **Sharp (0px)** corners for all primary containers, buttons, and input fields to reinforce the feeling of a rigid, institutional OS. 

- **Strictness:** Rounded corners are prohibited for layout-critical elements.
- **Exception:** Very small "Status Pills" (e.g., "Active Case") may use a 2px radius to provide a subtle visual hint that they are interactive "chips" rather than structural components, but full sharp edges are preferred.

## Components
- **Buttons:** High-contrast blocks. Primary buttons use a Legal Gold background with black text. Secondary buttons are "Ghost" style with white borders and mono-spaced text.
- **The Docket Entry (List Item):** A dense row featuring a JetBrains Mono timestamp, a Domine title, and a status indicator. Borders are 1px solid between items.
- **Input Fields:** Styled as "Blanks" on a form. 1px bottom border only when inactive; full 1px box when focused. Use JetBrains Mono for user input.
- **The "Dossier" Card:** A container with a "Header" strip in Midnight Blue. Content is displayed on a Paper White surface if it represents a physical filing.
- **Navigation (The Ledger):** Sidebar links are all-caps with a "Line Indicator" in Legal Gold to show the active section.
- **The "Seal" (Status Node):** A specialized component for verified documents. A circular border containing a monochromatic icon, always in Legal Gold or Success Green.
- **Action Bar:** A persistent bottom or top bar for "File," "Print," "Archive," and "Affix Signature."