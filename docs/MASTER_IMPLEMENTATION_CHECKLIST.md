# Chain of Command — Master Implementation Checklist & Build Contract
**Authoritative Source Document**: `docs/MASTER_IMPLEMENTATION_PROMPT_v2.md` (1,991 lines, v2.0)  
**Scope**: Case-Centric Legal Operating System with Multi-Agent AI Runtime & Cryptographic Provenance

---

## 1. Execution Discipline (§0)
- [x] Read the entire master specification document before writing a line of code
- [x] For every unit of work, run the 8-step loop: Orient → Recon → Plan → Confirm plan is safe → Implement → Test → Record → Report
- [x] **Orient**: Restate the feature, the user-visible outcome, and the constraining invariants in your own words
- [x] **Recon**: Inspect the existing repo first; never assume a file/table/endpoint/module does not exist; search before creating; extend before replacing; never delete working functionality without an explicit, recorded reason
- [x] **Plan**: Produce the seven-part plan (Context, Files affected, Dependencies, Database changes, API changes, Security implications, Testing requirements)
- [x] **Confirm safe**: If the work crosses any boundary in §2, stop and require human authorization via the §9.5 approval mechanism
- [x] **Implement**: Complete, production-grade files; no `// TODO`, no `...` elisions in critical paths, no stubbed security, no fake data pathways presented as real
- [x] **Test**: Satisfy the testing contract; every production module ships with tests as a condition of being "done"
- [x] **Record**: Update migrations, API types, OpenAPI specs, documentation, audit trail
- [x] **Report**: Close out in the required response format, including everything that cannot be verified
- [x] **Capability-Not-Verified Register**: For any unverifiable real-world capability (court API, legal authority, provider feature, data source), do not invent it — produce the interface, produce the configuration seam, register the unknown in the Capability-Not-Verified Register (Appendix H), and move on

---

## 2. Prime Directive & Operating Contract (§1)
- [x] **Prime Directive**: Increase effective access to legal information and self-representation capability without misrepresenting the system, overstating knowledge, or performing external legal actions for the user
- [x] Make the operating contract visible in the product, not merely in source code
- [x] **Law 1 — Do not fabricate**: Not a citation, API, case fact, provider capability, filing procedure, or legal conclusion; label as unverified or omit
- [x] **Law 2 — Do not act for the user in the outside world**: A human must explicitly authorize and perform every external legal action (filing, submitting, serving, contacting a court or opposing party, entering a plea)
- [x] **Law 3 — Do not leak or bypass authorization**: No model, tool, retrieved document, or agent may cross a boundary the authenticated human is not authorized to cross

### Definition of Done (§1.2)
- [x] Works for the happy path and fails safely for at least three adversarial paths
- [x] Typed end-to-end (no `any` escape hatches without a written justification comment)
- [x] Validates every external input (request bodies, query params, uploaded files, retrieved content, model output)
- [x] Authorizes on the server for every read and write (client-side checks are UX, never security)
- [x] Records an audit event for every significant state change and every AI operation
- [x] Never lets model output or retrieved content be treated as an instruction
- [x] Preserves source provenance for every legal claim
- [x] Ships unit + integration tests, plus specialized tests where it touches AI, DB, connectors, or auth
- [x] Migrations written and reversible; API types and OpenAPI regenerated; docs updated
- [x] Any new UI surface meets WCAG 2.2 AA and keyboard-only operation
- [x] States its assumptions and any unverified capabilities in the close-out report

---

## 3. Non-Negotiable Invariants — The Boundary Wall (§2)
- [x] **I-1**: AI assistance ≠ attorney–client relationship — enforced by onboarding acknowledgement, contextual notices, no "your lawyer"/"your attorney" framing, no attorney-like promises
- [x] **I-2**: AI analysis ≠ legal representation — enforced by output labeling (Information / Analysis / Draft / User-edited / Final) + persistent case-level notice
- [x] **I-3**: AI draft ≠ filed document — document state machine forbids transition to FILED without a human action outside the AI
- [x] **I-4**: A search result ≠ a verified legal conclusion — every authority carries a verification status; unverified authorities render distinctly
- [x] **I-5**: An attorney listing ≠ an attorney recommendation — directory is filter/search only; no ranking, scoring, "best," or AI pick
- [x] **I-6**: Sponsored placement ≠ endorsement — spatially and visually separated, labeled, excluded from any corpus an agent may retrieve from
- [x] **I-7**: Public docket information ≠ permission to automate a court — connectors declare capabilities; unknown = read-only + human step; no scraping that violates terms
- [x] **I-8**: A user request ≠ authorization for an external legal action — explicit, per-action, human confirmation object with scope, target, expiry
- [x] **I-9**: Retrieved content is data, never instruction — injection defense layer, tool-call gating, output sanitization
- [x] **I-10**: No fabricated authority — citation object with provenance; hallucination guard blocks ungrounded legal assertions from presenting as verified
- [x] **I-11**: No silent cross-case or cross-tenant access — row-level tenancy, per-request authorization context, agent permission ceilings
- [x] **I-12**: No hidden reasoning exposure — store structured rationales/sources/confidence; never surface raw chain-of-thought
- [x] Write at least one automated test per invariant that attempts to violate it and asserts the platform refuses (Adversarial Suite)

---

## 4. Product Vision, Scope & Non-Goals (§3)
- [x] Build the union of: Legal OS + AI Legal Team + Legal Research Engine + Case Management System + Document Workspace + Court Information Layer + Attorney Directory
- [x] Scope: Understanding charges/terminology; case organization; timeline construction; legal research with citations; document analysis; document drafting for review; deterministic deadline tracking; evidence organization; question/hearing prep; issue identification; procedural options; locating attorneys independently; audit and provenance
- [x] Non-goal: Autonomous filing/serving/pleading system (never)
- [x] Non-goal: "Best attorney for you" recommender or attorney rankings
- [x] Non-goal: Giving definitive legal advice, predicting outcomes as fact, or instructing on plea choices
- [x] Non-goal: General-purpose web scraping of court systems
- [x] Non-goal: Single-provider / single-model lock-in
- [x] Non-goal: Superficial "AI personas" over one shared prompt
- [x] Treat jurisdiction as first-class structured data on cases, sources, authorities, and agent contexts

---

## 5. Conceptual Architecture & Request Lifecycle (§4)
- [x] Architecture: User → Web App (Next.js) → API Gateway v1 → {Case Domain, Agent Runtime, Legal Library} → Model Gateway → Tool Registry → Data Plane (PostgreSQL) → Court Connector SDK
- [x] 11-step request lifecycle: Ingress → Case resolution → Intent classification → Agent selection → Authorization-aware context assembly → Retrieval + citation objects → Tool planning with approval gates → Model invocation → Post-processing → Persistence with audit → Streamed response
- [x] Agent lifecycle: `draft` → `validated` → `active` → `(paused)` → `retired` with transitions logged

---

## 6. The Two Interfaces (§5)
- [x] Typed structured-task operations contract: `analyze_document`, `build_case_timeline`, `search_authorities`, `compare_statutes`, `extract_deadlines`, `identify_issues`, `generate_questions`, `summarize_case`, `draft_document`, `analyze_docket`, `explain_charge`, `check_rights`, `structure_plea_decision`, `build_mitigation_profile`
- [x] Standard typed result envelope: payload, citations, confidence/disclosure, labeling, provenance, required approvals
- [x] Conversational chat routes through the exact same orchestrator, agent selection, retrieval, tool, and audit path
- [x] Interface independence: every capability reachable and testable without the chat UI

---

## 7. Stack & Monorepo Architecture (§6)
- [x] TypeScript strict throughout
- [x] Next.js App Router (`apps/web`) with versioned REST API (`/api/v1/...`) & SSE
- [x] Schema-first validation (Zod)
- [x] PostgreSQL with pgvector + native FTS (GIN)
- [x] Model Gateway abstraction: Gemini + Anthropic/OpenAI + Ollama local adapter + deterministic Fake adapter
- [x] Monorepo structure: `apps/{web, api}`, `packages/{core-domain, db, model-gateway, agent-runtime, tools, rag, legal-library, deadline-engine, court-connector-sdk, document-system, attorney-directory, auth, audit, ui-kit, shared}`
- [x] Zero circular dependencies; domain code never imports adapters directly
- [x] Verification rule: Verify current official provider documentation before encoding model features

---

## 8. Model Gateway (§7)
- [x] Single internal gateway abstraction seam (`apps/api/src/ai/model-gateway.ts`)
- [x] Contract interfaces: `Modality`, `TaskClass`, `ModelRequest`, `ModelPolicy`, `ModelResponse`, `ModelAdapter`
- [x] Routing rules: By task class via routing table; by declared capability; fallback chain with retry caps; structured output guarantees; residency enforcement; cost/latency budgets; audit logging of model & prompt versions
- [x] Deterministic fake provider adapter for hermetic, offline test suites

---

## 9. Agent Runtime & SDK (§8)
- [x] Agents as configured, versioned, permissioned units (`AgentManifest`)
- [x] Registry resolution: case override → workspace → system default
- [x] Capability-driven agent selection
- [x] Context assembly with authorization ceiling (`contextPolicy ∩ userAuthorization`)
- [x] Truncation priority: case facts > user request > agent memory > retrieved authorities > documents
- [x] Team configuration operations: add, remove, rename, set responsibilities, model policy, tool permissions
- [x] Validation rejects tool escalation, unauthorized document access, residency violations, and prompt guardrail tampering
- [x] 14 seeded system agents:
  1. Head Legal AI
  2. Paralegal AI
  3. Legal Research AI
  4. Rights Checker AI
  5. Charge Explainer AI
  6. Arrest Timeline AI
  7. Court Preparation AI
  8. Plea Decision Assistant (structure-only)
  9. Mitigation Builder
  10. Document Analysis AI
  11. Evidence Organizer AI
  12. Legal Document Drafting AI
  13. Case Timeline AI
  14. Docket Analyst AI

---

## 10. Tool System & Human Approval Gate (§9)
- [x] `ToolDescriptor` contract with typed schemas, required permissions, side-effect declarations, and compensation
- [x] 9-stage execution pipeline: contract check → permission check → input validation → approval gate → idempotency → sandboxed execution → output validation → immutable audit → compensation
- [x] Read/compute tools: `get_case_facts`, `get_case_documents`, `get_document_text`, `search_case_events`, `search_authorities`, `get_authority_by_citation`, `compare_authorities`, `compute_deadline`, `extract_entities`, `classify_document`, `summarize_text`, `list_court_resources`
- [x] In-platform write tools: `create_case_event`, `update_case_event`, `create_task`, `complete_task`, `attach_document`, `store_derived_document`, `write_memory_fact`, `create_timeline_export`, `build_evidence_index`
- [x] External-action tools (human-approved only): `send_email_to_court`, `file_document_with_court`, `submit_form_to_court`, `contact_opposing_party`, `send_document_to_third_party`
- [x] `HumanApproval` object: per-action, single-use, payload-bound, short-lived, logged with re-authentication

---

## 11. Database Architecture & Relational Schema (§10)
- [x] PostgreSQL with pgvector, GIN, and B-tree indexes
- [x] Row-level security (RLS) on all tenant- and case-scoped tables
- [x] Immutability for original documents in object storage
- [x] Core schema domains: Tenancy/Identity, Cases, Timeline/Events, Charges, Deadlines/Tasks, Documents, Drafts/Signatures, Legal Library/RAG, Agent Runtime, Research, Connectors, Attorney Directory, Audit/Provenance

---

## 12. Legal Source Architecture, Ingestion & RAG (§12)
- [x] Source Credibility Tiers:
  - **T1**: Primary official (statutes, court opinions, local court rules) — grounds legal claims
  - **T2**: Authoritative secondary (restatements, practice treatises) — grounds legal claims with labels
  - **T3**: Contextual (news, commentary) — context only, never authority
  - **T4**: Unvetted/user content — untrusted data
- [x] 8-stage ingestion: Acquire → Normalize → Version → Chunk → Embed → Index → Enrich → Verify
- [x] Legal chunking: Smallest citable subdivision for statutes/rules; paragraphs/headnotes for case law; retaining ancestry and pinpoint anchors
- [x] Hybrid retrieval: Lexical FTS (GIN) + Vector similarity (pgvector) + Exact citation lookup → RRF fusion → Rerank → Validity filter → `CitationObject` assembly

---

## 13. Citation Integrity & No-Fabrication Protocol (§13)
- [x] Hallucination guard in code: extracts claims/citations, verifies against stored corpus, validates verbatim quotes, verifies jurisdiction and overruling status
- [x] Downgrade output if any legal claim lacks a resolved citation
- [x] Structured confidence & disclosure block: grounded vs partially grounded vs ungrounded

---

## 14. Prompt-Injection & Untrusted-Content Defense (§14)
- [x] Structural separation: untrusted content enters inside `<UNTRUSTED_DATA>` blocks
- [x] Priority ordering: System > Developer > User > Untrusted Data
- [x] Tool-call gating: server validates call against allow-list regardless of prompt content
- [x] Output sanitization: strip executable scripts, sanitize markdown, prevent command injection
- [x] Chain-of-thought protection: store structured rationales; never surface raw model reasoning

---

## 15. Security Architecture (§15)
- [x] Standards-based OIDC + WebAuthn/MFA
- [x] Short-lived access tokens + rotating refresh tokens + server-side revocation
- [x] Re-authentication required for external legal actions and administrative settings
- [x] Defense-in-depth: RBAC + ABAC + Server Authorization Context + PostgreSQL RLS
- [x] Encryption in transit (TLS 1.2+) and at rest (AES-256 with KMS envelope encryption)
- [x] Strict SSRF protection on URL fetchers (allow-list, block private/link-local/metadata IP ranges)
- [x] 13 adversarial threat models covered with automated tests

---

## 16. Auditability, Provenance & Observability (§16)
- [x] Immutable, append-only `AuditEvent` with SHA-256 hash chaining
- [x] Full AI telemetry: user, case, agent, model + version, prompt version, tool calls, retrieved sources, token usage, human approvals
- [x] User-accessible audit log for case actions
- [x] OpenTelemetry-compatible traces and metrics dashboards

---

## 17. Deadline Rules Engine (§17)
- [x] Deterministic calculation via rules engine — arithmetic and calendars in code, never delegated to LLM
- [x] `DeadlineRule` model: trigger event, jurisdiction, court, calculation method, holiday exclusion, roll-forward logic
- [x] Explainable calculation trace: rule citation, trigger event, counting convention, holidays skipped, final due date
- [x] Explicit handling of unknown rules: return `rule_not_found` and advise human verification

---

## 18. Court Connector SDK (§18)
- [x] Modular `ConnectorCapabilityManifest` declaring permitted operations
- [x] Read-first architecture: dockets, calendars, local rules
- [x] Return `CapabilityNotVerified` for any undeclared capability
- [x] External-action requests require payload-bound human approval + fresh MFA
- [x] Local sandbox connector (mock court) for hermetic integration tests

---

## 19. Document System & State Machine (§19)
- [x] SHA-256 hashing and immutable storage for original files
- [x] Derived artifacts stored as versioned child documents
- [x] 6-state document lifecycle:
  `INFORMATION` → `ANALYSIS` → `DRAFT` → `USER_EDITED` → `USER_APPROVED` → `FINAL`
- [x] `FILED_EXTERNALLY` reachable only by human recording; AI can never transition a document to filed

---

## 20. Case Workspace, Timeline, Evidence & Tasks (§20)
- [x] Unified Case Workspace: overview, parties, charges, timeline, documents, evidence, deadlines, tasks, research, AI team, court activity, audit history
- [x] Timeline events: proposed (by AI/documents) vs confirmed (by human)
- [x] Evidence organizer: chain-of-custody tracking, document linking, factual notes
- [x] Plea Decision Assistant: structured neutral factor breakdown (exposure, characterization, collateral consequences), questions for counsel, explicit refusal to recommend

---

## 21. Attorney Directory (§21)
- [x] Independent search directory controlled by user filters (jurisdiction, practice area, fees, languages)
- [x] Zero rankings, zero AI recommendations, zero "best attorney" badges
- [x] Clear provenance labeling: Verified (bar record), Attorney-provided, Public record
- [x] Sponsored placement visually separated, labeled, and excluded from AI retrieval corpora

---

## 22. Safety, Disclaimers & Plain-Language Conduct (§22)
- [x] Contextual notices: onboarding, first case analysis, legal analysis outputs, drafts, external actions, directory
- [x] Crisis and safety routing for emergencies (e.g. 988 lifeline, domestic safety, immediate arrest)
- [x] Accessible tone with reading-level controls (Plain / Standard / Detailed) and integrated glossary

---

## 23. UX Architecture & Accessibility (§23)
- [x] Calm, high-trust legal operating system shell (not a generic chatbot)
- [x] Primary Navigation: Dashboard · Cases · AI Legal Team · Legal Library · Research · Documents · Timeline · Court Activity · Attorney Directory · Tasks · Settings
- [x] WCAG 2.2 Level AA compliance: contrast ≥ 4.5:1, visible focus rings, full keyboard navigability
- [x] High-contrast neutral data values, reserved amber focus, zero color-only semantics

---

## 24. API Design & Versioning (§24)
- [x] Versioned REST `/api/v1/...` with OpenAPI 3.1 specification
- [x] Standard structured error response: `{ error: { code, message, details, traceId } }`
- [x] Idempotency keys on non-idempotent writes
- [x] Standard `TaskResult<T>` envelope for all AI operations

---

## 25. Privacy, Data Lifecycle & Compliance (§26)
- [x] Tenant data residency constraints enforced at gateway and storage layers
- [x] Retention policies with legal-hold overrides
- [x] Data subject rights: portable machine-readable export and cascade deletion with tombstones
- [x] Zero-training model configurations

---

## 26. Cost, Rate Limiting & Reliability (§27)
- [x] Pre-flight budget enforcement per request, case, and tenant
- [x] Layered rate limiting (token bucket / sliding window)
- [x] Retries with exponential backoff and jitter for transient provider failures

---

## 27. Phased Implementation Roadmap (§30)
- [x] **Phase 0 — Foundation & Guardrails**: Tenancy, identity, MFA, sessions, RBAC/ABAC + RLS, audit log + hash chain, secrets/vault, CI with all gates, result envelope, error taxonomy, config, feature flags
- [x] **Phase 1 — Case Core**: Cases, parties, members, settings, tasks, case documents (ingest + immutable original + versions), timeline events (proposed vs. verified), and shell UI for Dashboard/Cases/Timeline/Documents/Tasks
- [x] **Phase 2 — Model Gateway + Agent Runtime**: Provider adapters (Gemini + one other + fake + optional local), routing/fallback/budgets, agent manifests, registry, versioned prompts, context builder with permission intersection, seed agents, agent team UI
- [x] **Phase 3 — Legal Library + RAG + Citations**: Authority ingestion (Tier-1/2), versioning, chunking, embeddings, hybrid retrieval, rerank, citation objects, grounding guard, research workbench with citations and grounding labels, RAG eval harness
- [x] **Phase 4 — Case Intelligence**: Charge explainer, rights checker, timeline builder, issue identifier, question generator, case summarizer, evidence organizer, plea-decision structurer (structure-only), mitigation builder
- [x] **Phase 5 — Deadline Engine + Court Activity + Connector SDK**: Rules engine with versioned rules + calendars; deadline computation with explanations; connector SDK + mock court + read-only reference connector; Court Activity surface; external-action request/approval plumbing
- [x] **Phase 6 — Document Workflow**: Document analysis end-to-end, template registry (versioned), draft generation, review/edit/approve state machine, signatures, and rule that AI cannot mark anything filed
- [x] **Phase 7 — Attorney Directory**: Neutral directory: entities, provenance labels, filters, sponsored separation, educational content, no ranking/recommendation; ethics/UPL review gates per jurisdiction
- [x] **Phase 8 — Advanced Platform**: User-created agents (validated), multi-agent orchestration, offline/local Ollama, and VeriCue AI forensic telemetry console

---

## 28. Appendices Deliverables (A–H)
- [x] **Appendix A**: `AgentManifest` JSON Schema with immutable guardrails
- [x] **Appendix B**: `ToolDescriptor` JSON Schema with human approval requirement for external actions
- [x] **Appendix C**: 14 Seed Agent Contracts and prompt specifications
- [x] **Appendix D**: Guardrail & Disclaimer Copy Matrix across 7 placements
- [x] **Appendix E**: PostgreSQL Relational DDL with pgvector, GIN, and RLS policies
- [x] **Appendix F**: Executable Red-Team Corpus (18 adversarial test scenarios)
- [x] **Appendix G**: Environment & Configuration Checklist
- [x] **Appendix H**: Capability-Not-Verified Register seeded with 7 initial entries
