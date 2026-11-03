# The Wire

**The Wire** is Chain of Command’s **agent playground** (out-of-app owner/devops surface and swarm shell).  
It is **not** in-app Chambers counsel and **not** the production Michael worker daemon under `agent/multi-agent` alone — it is the interactive playground / face for the multi-agent mesh.

| Surface | Route | Notes |
|--------|--------|--------|
| Swarm shell (CoC web) | `/playground`, `/chambers`, `/ai-intelligence` | Calls The Wire API; demo fallback if offline |
| Native Wire UI host | `/wire` | Embeds daemon UI (default `:3100`) |
| Legacy alias | `/empyrean` | Redirects to `/wire` |
| API rewrite | `/wire-api/*` (legacy `/empyrean-api/*`) | → `WIRE_URL` or `EMPYREAN_URL` or `http://localhost:3100` |

## Run locally

```bash
npm run dev:wire    # playground daemon on :3100
npm run dev         # Next web on :3000
# or
npm run dev:all
```

Package path remains `apps/empyrean` for now (internal folder name); **product name is The Wire only**.

## Naming

- **Use:** The Wire  
- **Do not use in UI/docs:** Empyrean, “agent playground” as a product name without The Wire  
- **Out-of-app workers:** Michael / Gabriel / Raphael / Metatron / Seraphim (see `docs/AGENT_PLANES.md`)
