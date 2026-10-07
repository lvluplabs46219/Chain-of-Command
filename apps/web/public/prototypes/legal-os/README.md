# Chain of Command — Legal OS (interactive prototype)

Standalone, fully interactive design exploration of the Legal OS shell.

## Open

```
/prototypes/legal-os/
```

(or open `index.html` via any static server / Next `public/` path)

## Screens (all live)

| Nav | Screen |
|-----|--------|
| Design System | Tokens, tags, buttons |
| Command Center | Case KPIs, speedy-trial clock, agent roster |
| The Docket | Charges & statutory elements |
| Chambers | Multi-agent chat + quick prompts |
| Law Library | Authority search with verification tags |
| Investigations | Evidence locker / chain of custody |
| Record Room | Document index |
| Case Timeline | Chronology + contradiction flags |
| Court Watch | Hearing logistics + human filing gate |
| Counsel Directory | Neutral attorney/legal-aid list |
| Motions & Tasks | Deadline schedule |

## Files

- `index.html` — shell + nav + React bootstrap
- `chain-of-command.css` — design tokens & layout
- `ui.jsx` — icons, Card, Tag, PageHead, Metric, useTweaks
- `screens-a.jsx` — System, Command Center, Docket
- `screens-b.jsx` — Chambers, Library
- `screens-c.jsx` — Records, Timeline, Court Watch, Tasks, Investigations, Counsel
- `tweaks_panel.jsx` — palette / glow / density controls

## Note

This is a **prototype**. Production workspace pages live under `apps/web/src/components/workspace/` (React + Tailwind).
