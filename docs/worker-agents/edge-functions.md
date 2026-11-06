# Edge Function Workers (Supabase)

**Plane:** `out_of_app`  
These are always-on backend workers that run on Supabase Edge Functions. They are part of the worker agent system, not the in-app counsel plane.

## Active Functions (Chain of Command project)

| Slug | Purpose |
|------|---------|
| `dispatch-to-michael` | Primary remote entry point into the Michael orchestrator / verification path |
| `courtlistener-search` | Search CourtListener data |
| `courtlistener-sync` | Synchronize CourtListener data into the platform |
| `courtlistener-webhook` | Receive and process CourtListener webhooks |
| `cold-cases-stream-ingest` | Stream / ingest cold-case related data |

## Rules

- These functions serve the platform and the worker mesh.
- They must not be treated as in-app legal agents.
- Authentication and JWT verification settings should be reviewed regularly (`verify_jwt` is enabled on most of them).
- Secrets and API keys stay in Supabase / Infisical — never in product agent prompts or client code.

## Relationship to the Divine Hierarchy

`dispatch-to-michael` is the bridge that allows remote systems (and other workers) to hand work to Michael for verification and orchestration without requiring the owner’s laptop to be online.
