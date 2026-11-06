# Glossary of Defined Terms — Chain of Command

**Status:** Canonical terminology policy (v0.2)  
**Rule:** One canonical name per concept. Paths are implementation locations, not product or workforce names.  
**Scope:** Product terminology, agent planes, worker identities, communication, and routing.

## Hard redaction

| Term | Status |
|------|--------|
| **Acquit.ai** / **Acquit** (product brand) | **REDACTED** — early title only. The product is **Chain of Command**. Do not use the redacted name in UI, documentation, navigation, or marketing. |

## Products

| Term | Definition |
|------|------------|
| **Chain of Command (CoC)** | Primary case-work application and this repository. |
| **Empyrean** | Separate multi-agent application: `lvluplabs46219/empyrean`. It is not a CoC place name. |
| **The Wire** | CoC agent playground surface (`/wire`, `/wire-api`). It is not Empyrean. |

## The two agent workforces (canonical distinction)

Chain of Command contains **two separate agent workforces**, implemented as two distinct planes. They have different audiences, authority, interfaces, permissions, and responsibilities. They must never be collapsed into one roster or presented as interchangeable agents.

### 1. In-App Agent Workforce — Product Counsel Plane

**Canonical identifier:** `in_app`  
**Purpose:** Provide the litigant with educational legal-information and case-work assistance inside Chain of Command. These are the personas the user sees and communicates with in the product.

**Audience and surfaces:** Pro se litigants in the Case Workspace, Chambers, Agent Directory, Command Center roster, and `POST /api/ai/lawyer`.

**Responsibilities:** Explain charges and legal concepts; research legal authorities; organize documents and evidence; build timelines; identify procedural or rights-related issues; support court preparation; and prepare draft materials for human review.

**Canonical in-app persona identifiers** (from `InAppLegalPersonaName`):
- `head_counsel` — coordinates counsel-style assistance, strategy framing, and planning.
- `paralegal` — document organization, drafting support, and deadline-related organization.
- `rights_checker` — flags constitutional or procedural-rights questions for review.
- `timeline_spotter` — chronology and potential contradiction analysis.
- `charge_explainer` — plain-language explanation of charges and related concepts.
- `research_counsel` — legal authority retrieval and research synthesis.
- `court_prep` — hearing and appearance preparation support.
- `document_analyst` — document and evidence analysis.

Display labels and the exact live roster are controlled by application code, especially `apps/web/src/lib/workspace-data.ts` (`SPECIALIST_AGENTS_ROSTER` / `getInAppAgents()`) and `packages/agent-runtime/src/catalog.ts` (`SEED_AGENTS`). The names above are protocol identifiers, not a guarantee that every persona is currently enabled in every UI.

**Non-negotiable boundaries:**
- These agents provide educational assistance; they do not claim to be attorneys or provide licensed legal representation.
- They must not autonomously file documents, contact courts, enter pleas, or take other external legal actions.
- Outputs that may be used in a legal proceeding require human review.
- Legal citations must be grounded in sources or explicitly marked unverified.
- They must not receive `shell.exec`, production deployment privileges, infrastructure secrets, or direct control of the out-of-app worker mesh.
- The in-app roster must contain only in-app personas. Never list YHWH, Michael, Gabriel, Raphael, Metatron, or Seraphim as the user's counsel or case team.

### 2. Out-of-App Worker Workforce — Owner Operations Plane

**Canonical identifier:** `out_of_app`  
**Purpose:** Build, diagnose, patch, verify, govern, migrate, and operate the Chain of Command platform itself. This is the platform-owner/engineering workforce, not the litigant-facing legal team.

**Audience and surfaces:** Platform owner and authorized engineers; local multi-agent runtime under `agent/multi-agent/`, Unix Domain Socket (UDS) transport, CLI workers, CI/automation, and authorized platform operations. These workers must never appear in Chambers, the Agent Directory, or another litigant-facing counsel surface.

**Canonical worker identities** (from `OutOfAppWorkerName`):

| Worker | Primary function | Use this worker for |
|--------|------------------|---------------------|
| **Seraphim** (`seraphim`) | Diagnostics and external inference pool | Inspect environments, run tests, collect errors/logs, produce structured diagnostic findings, and access the configured external inference pool. Does not generate patches or approve changes. |
| **Gabriel** (`gabriel`) | Patch generation, messaging, and delivery | Turn diagnostic findings into proposed code patches; notify workers/systems; deliver structured results. Does not perform final verification or policy approval. |
| **Michael** (`michael`) | Orchestration and verification | Receive owner tasks, create dependency-aware task plans/DAGs, dispatch work, coordinate workers, verify proposed patches in an isolated E2B sandbox or configured local fallback, and report verification evidence. Does not make the final policy approval. |
| **YHWH** (`yhwh`) | Governance and policy gate | Evaluate verification evidence and hard safety/policy rules; approve or reject a proposed change before commit/merge. Has veto authority in the documented worker repair pipeline. Does not generate patches or run the test suite itself. |
| **Raphael** (`raphael`) | General task execution | Execute authorized shell, file scaffolding, database migration, workspace maintenance, and dispatched task handlers. It is the execution/implementation worker, not the orchestrator or final policy authority. |
| **Metatron** (`metatron`) | Model gateway | Route model requests among configured providers, handle fallback/rate-limit/provider availability, and centralize observable model access. It is infrastructure, not a legal persona. |

**Canonical repair / verification sequence:**

```
Seraphim (diagnose)
    → Gabriel (prepare patch)
    → Michael (verify in isolated environment)
    → YHWH (policy approve/reject)
    → authorized commit / merge step
```

Michael also serves as the broader mesh orchestrator and can dispatch implementation work to Raphael and coordinate Gabriel, Metatron, and Seraphim as appropriate. The sequence is a responsibility handoff, not a claim that every task must invoke all six workers.

**Non-negotiable boundaries:**
- Every worker uses `plane: "out_of_app"` and remains excluded from litigant-facing rosters.
- Worker access to repositories, shell, CI, migrations, and infrastructure must be explicitly authorized and scoped.
- Secrets and credentials must flow through approved environment configuration / Infisical, never hard-coded into prompts, source files, or product-agent context.
- In-app agents must not receive direct worker access or privileged worker tools.
- A legal task kind may be executed by Raphael as a backend handler when explicitly routed, but the user-facing persona remains an in-app agent. Backend execution does not convert a worker into counsel.

## Workforce interaction and communication protocol

### Choose the correct workforce first

| Need | Correct entry point |
|------|---------------------|
| Understand a charge, research law, organize case evidence, build a case timeline, analyze case documents, or prepare for court | Communicate with the appropriate **in-app persona** through the Case Workspace / Chambers / product interface. |
| Change application code, debug a build, inspect service health, repair infrastructure, run tests, perform a migration, or coordinate platform work | Give an owner/engineering task to **Michael** or the authorized out-of-app dispatch interface. |
| Diagnose failures or gather a test/error report | Michael may dispatch **Seraphim** (`code.diagnose`). |
| Prepare a code change from diagnostics | Michael may dispatch **Gabriel** (`code.patch`). |
| Execute a concrete implementation, shell, file, database, or maintenance task | Michael may dispatch **Raphael** using the matching authorized task kind. |
| Verify a proposed patch or test result | **Michael** (`code.verify`). |
| Evaluate whether a change is allowed to proceed | **YHWH** (`code.approve`). |
| Route a model request or handle provider fallback | **Metatron** (`llm.reason` / gateway routing). |
| Send a notification or deliver a result | **Gabriel** (`notify`, `deliver_payload`). |

Do not address an out-of-app worker as though it were the user's in-app legal assistant. Do not send legal case details to the owner worker mesh unless a specific authorized backend task requires that data and the relevant privacy and access controls permit it.

### How to write a useful worker instruction

A worker directive should be specific, bounded, and auditable. Include:

1. **Objective:** the outcome required, expressed as a result rather than a vague activity.
2. **Context:** relevant repository, branch, environment, service, task-tracker item, and observed symptoms.
3. **Scope:** allowed files/services and explicit exclusions. State whether changes, migrations, deployments, or external actions are prohibited or authorized.
4. **Evidence:** logs, failing tests, error messages, reproduction steps, and links/paths.
5. **Acceptance criteria:** exact checks that demonstrate completion (tests, build, health check, migration status, review).
6. **Reporting:** require changed paths, commands/checks run, results, unresolved risks, and commit/PR references.

**Example owner directive to Michael:**

```text
Michael — investigate and repair [specific failure] in [repository/branch].
Start by inspecting the relevant logs and current implementation. Follow the
repository task tracker and existing operating instructions. Delegate diagnosis,
patching, and implementation to the appropriate workers. Do not deploy or
perform destructive database operations. Run the relevant tests and build,
verify the patch in an isolated environment, and obtain the required YHWH
policy approval before any authorized commit or merge. Report the root cause,
files changed, verification evidence, outstanding risks, and commit/PR link.
```

This is an instruction template, not a command that bypasses repository policy or tool authorization.

### How the worker mesh communicates

The shared contract is defined in `agent/multi-agent/src/protocol/types.ts`:

- **Envelope:** a structured message with `id`, `type`, `from`, `to`, optional `correlationId`, ISO `createdAt`, and `payload`.
- **Message types:** `directive`, `task`, `task_result`, `event`, and `query`.
- **Task node:** `id`, typed `kind`, `dependsOn` task IDs, and `payload`. Dependency links form an execution tree / DAG.
- **Task states:** `pending`, `dispatched`, `running`, `succeeded`, `failed`, `fallback`, and `skipped`.
- **Task result:** `taskId`, `state`, optional `output`, and optional `error`.
- **Correlation ID:** use it to tie a directive, delegated tasks, events, and task results to the same work request.

The runtime documents newline-delimited JSON over the UDS socket at `/tmp/coc-michael.sock`; the daemon, CLI, and configured dispatcher are the supported operational surfaces. Do not invent a direct chat channel or assume that sending a natural-language message to a worker name is itself a transport operation. Use the runtime's CLI / dispatcher / documented API and its actual message schema.

### Current documented CLI entry points

From the repository's `agent/multi-agent/` directory:

```bash
cp .env.example .env
npm install
npm run build
npm start
npm run worker
npm run send -- "summarize docs"
```

The documented `npm run send -- "…"` command is the simple natural-language send example. Confirm the daemon is running and the local environment is configured before sending. Keep credentials in environment variables; do not paste secrets into task messages.

### Task taxonomy

The protocol defines these task kinds. Use only task kinds that the current runtime actually registers and supports; a type declaration alone is not proof of a live handler.

| Task kind | Intended responsibility |
|------------|-------------------------|
| `code.diagnose` | Seraphim-style diagnostics |
| `code.patch` | Gabriel-style patch generation |
| `code.verify` | Michael-style isolated verification |
| `code.approve` | YHWH-style policy gate |
| `shell.exec` | Raphael shell execution |
| `file.scaffold` | Raphael file creation/scaffolding |
| `db.migrate` | Raphael database migration |
| `workspace.maintain` | Raphael lint/format/build maintenance |
| `notify` / `deliver_payload` | Gabriel notification and delivery |
| `llm.reason` | YHWH / Metatron reasoning and model gateway path |
| `legal.*` | Backend legal task handlers; not a reason to expose workers as product counsel |

### How a completed task should be reported

A useful completion report should include: task/correlation ID; final state; root cause or summary; files/services affected; actions performed; tests/builds and their actual outputs; verification backend (for example E2B or local); approval status; commit/PR/deployment reference when applicable; and remaining risks or follow-up work. A worker must report failure or uncertainty explicitly rather than claiming success without evidence.

## Plane routing at a glance

```
LITIGANT / CASE WORKSPACE
    → in_app legal persona
    → model gateway / retrieval / permitted tools
    → grounded result + audit
    → human review and user-controlled action

PLATFORM OWNER / ENGINEERING
    → Michael / authorized dispatcher
    → task DAG across out_of_app workers
    → verification evidence
    → YHWH policy approval
    → authorized repository / infrastructure change
```

**Never list YHWH, Michael, Gabriel, Raphael, Metatron, or Seraphim as Chambers counsel. Never give in-app agents privileged worker tools. Never allow an AI agent to silently take an external legal action.**

## CoC places

**Command Center**, **The Docket**, **Law Library**, **Draft Desk**, **Court Watch**, **Counsel / Agent Directory**, **Settings**, and **The Wire** are product surfaces or places. They are not agent identities or workforce names.

## Related sources of truth

| Topic | Canonical source |
|-------|------------------|
| Plane separation and routing | `docs/AGENT_PLANES.md` |
| In-app personas | `docs/in-app-agents/README.md`, `docs/in-app-agents/`, `apps/web/src/lib/workspace-data.ts`, `packages/agent-runtime/src/catalog.ts` |
| Out-of-app workers | `docs/worker-agents/README.md`, individual worker specifications in `docs/worker-agents/` |
| Message types, task kinds, envelope, and routing identifiers | `agent/multi-agent/src/protocol/types.ts` |
| Runtime operation and CLI | `agent/multi-agent/README.md` |
| Repository-wide operating rules and task-tracker requirement | `AGENTS.md` |

## Open terminology decisions (not locked)

- Chambers vs. court-comms naming
- AI Lawyer navigation label
- VeriCue as a module vs. separate product

When implementation and this glossary diverge, do not silently invent a third definition. Flag the discrepancy and reconcile the authoritative source documents and code.
