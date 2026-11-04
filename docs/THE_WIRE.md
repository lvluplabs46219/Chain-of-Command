# The Wire

**The Wire** is the multi-agent swarm **section** of Chain of Command (AI Lawyer / AI Legal Team nav slot).  
It is not a second product and does not replace the app’s document/module navigation.

| Surface | Route | Notes |
|--------|--------|--------|
| AI Lawyer section (in-app) | `/chambers`, `/playground`, `/ai-intelligence` | Same MasterApp shell + nav; mounts the swarm UI under the AI Lawyer tab |
| Native Wire UI host | `/wire` | Embeds daemon UI (default `:3100`) — specialized section, still CoC |
| Legacy alias | `/empyrean` | Redirects to `/wire` |
| API rewrite | `/wire-api/*` (legacy `/empyrean-api/*`) | → `WIRE_URL` or `EMPYREAN_URL` or `http://localhost:3100` |

Sections intentionally feel different (swarm vs docket vs timeline). That is one product with distinct surfaces, not separate apps.

## Run locally

```bash
npm run dev:wire    # playground daemon on :3100
npm run dev         # Next web on :3000
# or
npm run dev:all
```

Package path remains `apps/empyrean` for now (internal folder name).

## Naming

- **Product / nav:** Chain of Command → AI Lawyer (or AI Legal Team)
- **Section face / daemon:** The Wire (internal to that section)
- **Do not** present The Wire as a competing top-level product or alternate primary nav
- **Out-of-app workers:** Michael / Gabriel / Raphael / Metatron / Seraphim (see `docs/AGENT_PLANES.md`)
