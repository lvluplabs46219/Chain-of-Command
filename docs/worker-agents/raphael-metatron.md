# Raphael & Metatron — Supporting Worker Agents

**Plane:** `out_of_app`

These two workers support the core Seraphim → Gabriel → Michael → YHWH loop and the broader multi-agent mesh.

---

## Raphael — Task Worker

**Role:** General-purpose task executor

### Responsibilities

- `shell.exec`
- `file.scaffold`
- `db.migrate`
- `workspace.maintain`
- Backend handlers for legal *task kinds* when dispatched by Michael (the work is still `out_of_app`; the persona the litigant sees remains an in-app agent)

Raphael is the “hands” of the mesh. It does the actual mechanical work that other agents decide is needed.

### Boundaries

- Does not decide *what* should be done (orchestration stays with Michael)
- Does not make final policy decisions
- Never listed in Chambers or Directory

---

## Metatron — Model Gateway

**Role:** Provider routing and fallback

### Responsibilities

- Route model requests to the appropriate provider
- Handle fallbacks when a provider is unavailable or rate-limited
- Keep the worker plane’s LLM access centralized and observable

### Boundaries

- Pure infrastructure — no domain logic of its own
- Not a legal persona
- Not visible to litigants

---

Both agents live exclusively on the `out_of_app` plane and are documented here so they are never confused with in-app counsel agents.
