---
name: Candy — Playful & Vibrant
colors:
  surface: '#fff7fb'
  surface-dim: '#efd0f7'
  surface-bright: '#fff7fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ffefff'
  surface-container: '#fde7ff'
  surface-container-high: '#fae0ff'
  surface-container-highest: '#f8d8ff'
  on-surface: '#281330'
  on-surface-variant: '#57414a'
  inverse-surface: '#3e2846'
  inverse-on-surface: '#feebff'
  outline: '#8a707b'
  outline-variant: '#ddbfca'
  surface-tint: '#b2107b'
  primary: '#af0a78'
  on-primary: '#ffffff'
  primary-container: '#cf3192'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffafd5'
  secondary: '#744aa2'
  on-secondary: '#ffffff'
  secondary-container: '#cda0fe'
  on-secondary-container: '#5a3086'
  tertiary: '#006388'
  on-tertiary: '#ffffff'
  tertiary-container: '#007dab'
  on-tertiary-container: '#fcfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd8e8'
  primary-fixed-dim: '#ffafd5'
  on-primary-fixed: '#3d0027'
  on-primary-fixed-variant: '#8a005e'
  secondary-fixed: '#efdbff'
  secondary-fixed-dim: '#dbb8ff'
  on-secondary-fixed: '#2b0052'
  on-secondary-fixed-variant: '#5b3188'
  tertiary-fixed: '#c5e7ff'
  tertiary-fixed-dim: '#7ed0ff'
  on-tertiary-fixed: '#001e2d'
  on-tertiary-fixed-variant: '#004c6a'
  background: '#fff7fb'
  on-background: '#281330'
  surface-variant: '#f8d8ff'
typography:
  headline-lg:
    fontFamily: DM Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

# Candy — Playful & Vibrant

## North Star: "Joyful Pop"
Bold, fun, and energetic. Saturated colors, pill-shaped elements, and bouncy microinteractions. Designed to delight.

## Colors
- **Primary (`#e040a0` / `#af0a78`):** Hot pink — primary actions and brand identity.
- **Secondary (`#7c52aa` / `#744aa2`):** Purple — secondary elements, tags, categories.
- **Tertiary (`#0096cc` / `#006388`):** Sky blue — informational, links, highlights.
- **Neutral (`#604868` / `#281330`):** Deep muted purple-plum — structure and readable contrast against light surfaces.
- **Background (`#fff7fb` / `#ffffff`):** Clean light surface — immersive, modern light mode experience.
- Use all three accent colors freely but with purpose. This palette is expressive.

## Typography
- **All fonts:** DM Sans — rounded, friendly, modern.
- Use bold weight for headings, medium for labels. Generous line-height.
- Slightly larger base size (16px body) for friendliness.
- Code / Monospace: JetBrains Mono.

## Shapes & Motion
- **Border radius:** Full/pill on buttons and badges (`rounded-full`). 16-24px on cards (`rounded-2xl` / `rounded-3xl`).
- **Microinteractions:** Bouncy hover transitions (`transform: scale(1.02)`, spring-like timing).
- **Shadows:** Colorful — use tinted shadows matching the element color at 15-22% opacity.
  Example: pink button gets `box-shadow: 0 4px 16px rgba(224, 64, 160, 0.22)`.

## Components
- **Buttons:** Pill-shaped, solid fill or gradient, tinted shadow. Hover = slight scale + deeper shadow.
- **Cards:** Large radius (16-24px), white surface fill, tinted shadow. Hover = lift animation.
- **Badges/Tags:** Pill-shaped, tinted fill, bold text.
- **Inputs:** Rounded (pill or 0.75rem-1rem), surface fill, pink focus ring.

## Rules
- Embrace color contrast and saturation. Nothing should feel washed out against the light background.
- Rounded shapes everywhere — no sharp corners in this system.
- Animations should feel bouncy and playful, not stiff. Use ease-out curves.
