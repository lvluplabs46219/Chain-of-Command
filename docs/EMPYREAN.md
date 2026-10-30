# Empyrean in Chain of Command

**Policy:** Empyrean (`apps/empyrean`) is a first-class face of the platform.
**Do not modify Empyrean internals** for product integration. Integrate from
`apps/web` and root tooling only.

## What lives where

| Piece | Location | Notes |
|-------|----------|--------|
| Empyrean daemon + native UI | `apps/empyrean` | Unchanged source of truth |
| API proxy | `apps/web` rewrite `/empyrean-api/*` → `EMPYREAN_URL` | next.config.mjs |
| CoC playground / AI lawyer shell | `/playground`, `/chambers`, `/ai-intelligence` | Calls Empyrean API; demo fallback if offline |
| Native Empyrean UI in CoC chrome | `/empyrean` | iframe to `NEXT_PUBLIC_EMPYREAN_ORIGIN` (default `http://localhost:3100`) |

## Run

```bash
# Terminal A — Empyrean (port 3100 by default)
npm run dev:empyrean

# Terminal B — Chain of Command web
npm run dev
```

Optional env on web:

```bash
EMPYREAN_URL=http://localhost:3100
NEXT_PUBLIC_EMPYREAN_ORIGIN=http://localhost:3100
```

## Product rule

Candy theme and CoC places wrap or call Empyrean. Empyrean keeps its own UI,
orchestration (Michael / swarm), and API surface.
