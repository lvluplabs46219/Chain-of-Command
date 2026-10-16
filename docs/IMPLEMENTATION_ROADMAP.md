# CHAIN OF COMMAND - IMPLEMENTATION ROADMAP

**Based on:** Master Implementation Prompt v2.0  
**Current Status:** Phase 1-2 Transition  
**Date:** 2026-10-16  
**Executor:** AI Engineer with MCP Server Access

---

## 📊 CURRENT STATE ASSESSMENT

### ✅ What's Already Built

#### Database Schema (Phase 1 - Case Core)
- **Core Tables:** users, matters, parties, documents, document_chunks
- **Case Management:** evidence_items, timeline_events, deadlines
- **Legal Library:** sources, authorities, legal_chunks
- **Audit:** audit_logs
- **Attorney Directory:** lawyer_profiles, directory_subscriptions, agent_referrals
- **Technology:** Drizzle ORM with PostgreSQL, pgvector for embeddings

#### API Layer (Phase 1 - Partial)
- **Routes:** matters, documents, directory, courtlistener, ai, gemini, workflow, audit, filing, webhooks, health
- **Middleware:** Session verification, CORS, Helmet security headers
- **Authentication:** Basic session verification exists

#### Frontend (Phase 1 - Partial)
- **Framework:** Next.js 15 with React 19
- **UI:** Components exist (App.tsx, contexts, hooks, lib, styles)
- **Styling:** Tailwind CSS 4

#### Packages (Phase 2 - Starting)
- **@chain-of-command/db:** Drizzle schema with vector support
- **@chain-of-command/agent-sdk:** Basic structure (manifest.ts, tool.ts, index.ts)
- **@chain-of-command/rag-engine:** Package exists, needs implementation
- **@chain-of-command/audit:** Package exists
- **@chain-of-command/database:** Database utilities
- **@chain-of-command/connectors:** Connector SDK structure
- **@chain-of-command/security:** Security utilities

### ⚠️ What's Missing or Incomplete

#### Phase 0 - Foundation & Guardrails
- [ ] Row-Level Security (RLS) implementation
- [ ] Complete RBAC/ABAC system
- [ ] Full audit log with hash chain
- [ ] Secrets/vault integration
- [ ] CI/CD with all gates
- [ ] Result envelope pattern
- [ ] Error taxonomy
- [ ] Config system
- [ ] Feature flags

#### Phase 1 - Case Core
- [ ] Complete CRUD for all domain tables
- [ ] Input validation for all endpoints
- [ ] Authorization checks for all endpoints
- [ ] API types and OpenAPI specs
- [ ] Documentation
- [ ] Tests (unit, integration, adversarial)

#### Phase 2 - Model Gateway + Agent Runtime
- [ ] ModelAdapter interface implementation
- [ ] Provider adapters (Gemini, Ollama, Fake)
- [ ] Routing, fallback, budgets
- [ ] Agent manifests (all 14 seeded agents)
- [ ] Agent registry
- [ ] Versioned prompts
- [ ] Context builder with permission intersection
- [ ] Orchestrator
- [ ] Agent team UI
- [ ] Tests proving end-to-end agent execution

#### Phase 3 - Legal Library + RAG + Citations
- [ ] Authority ingestion pipeline
- [ ] Chunking (legal-domain specific)
- [ ] Embeddings
- [ ] Hybrid retrieval (vector + keyword)
- [ ] Reranking
- [ ] Citation objects
- [ ] Grounding guard
- [ ] Research workbench UI
- [ ] RAG eval harness

#### Phase 4 - Case Intelligence
- [ ] All 14 seeded agent implementations
- [ ] Agent capability validation
- [ ] Multi-agent orchestration
- [ ] Case intelligence features

#### Phase 5+ - Advanced Features
- [ ] Deadline engine with rules
- [ ] Court connector SDK
- [ ] Document workflow
- [ ] Attorney directory
- [ ] Advanced platform features

---

## 🎯 BUILD ORDER WITH ACCEPTANCE CRITERIA

### Phase 0 — Foundation & Guardrails
**Priority:** CRITICAL (Blocker for all other phases)

#### Objectives
1. Implement tenancy model
2. Implement RBAC/ABAC authorization
3. Implement Row-Level Security (RLS) in PostgreSQL
4. Complete audit logging with hash chain
5. Set up secrets/vault
6. Configure CI/CD with all gates
7. Define result envelope pattern
8. Define error taxonomy
9. Configure config system
10. Implement feature flags

#### Deliverables
- [ ] `packages/auth/` - Authentication and authorization system
- [ ] `packages/audit/` - Complete audit logging with hash chain
- [ ] Database migrations for RLS policies
- [ ] CI/CD pipeline configuration
- [ ] `.env.example` with all required variables
- [ ] Error handling middleware
- [ ] Result envelope types

#### Acceptance Criteria
- ✅ Cross-tenant access impossible and proven by test
- ✅ Audit append-only and verifiable
- ✅ CI green and blocking
- ✅ All secrets managed through vault
- ✅ Feature flags functional

#### Estimated Time: 2-3 days

---

### Phase 1 — Case Core
**Priority:** CRITICAL (Dependencies: Phase 0)

#### Objectives
1. Complete all domain entity CRUD operations
2. Implement input validation for all endpoints
3. Implement authorization for all endpoints
4. Create API types and OpenAPI specifications
5. Build shell UI for all case features

#### Deliverables
- [ ] `apps/api/src/routes/` - Complete CRUD for all tables
  - [x] matters.ts (partially done)
  - [ ] parties.ts
  - [ ] documents.ts (exists, needs completion)
  - [ ] evidence.ts
  - [ ] timeline.ts
  - [ ] deadlines.ts
  - [ ] sources.ts
  - [ ] authorities.ts
- [ ] Input validation schemas (Zod)
- [ ] Authorization middleware
- [ ] API types (TypeScript)
- [ ] OpenAPI spec generation
- [ ] `apps/web/` - UI for Dashboard, Cases, Timeline, Documents, Tasks
- [ ] Tests (unit, integration)

#### Acceptance Criteria
- ✅ A user can create a case
- ✅ A user can upload a document
- ✅ A user can build a timeline
- ✅ All writes audited
- ✅ RLS tested and verified
- ✅ OpenAPI spec valid

#### Estimated Time: 3-5 days

---

### Phase 2 — Model Gateway + Agent Runtime
**Priority:** HIGH (Dependencies: Phase 0, Phase 1)

#### Part A: Model Gateway

##### Objectives
1. Implement ModelAdapter interface
2. Create provider adapters (Gemini, Ollama, Fake)
3. Implement routing with fallback
4. Implement budget enforcement
5. Implement structured output validation

##### Deliverables
- [ ] `packages/model-gateway/src/`
  - [ ] `types.ts` - ModelRequest, ModelResponse, ModelPolicy interfaces
  - [ ] `adapters/` - Provider implementations
    - [ ] `gemini.ts`
    - [ ] `ollama.ts`
    - [ ] `fake.ts` (for testing)
  - [ ] `router.ts` - Routing logic
  - [ ] `budget.ts` - Cost tracking
  - [ ] `index.ts` - Main gateway
  - [ ] `config.ts` - Provider configuration

##### Acceptance Criteria
- ✅ Structured task runs end-to-end with full audit
- ✅ Out-of-policy request is refused
- ✅ Agent config validation rejects escalation
- ✅ Fake-provider determinism

#### Part B: Agent Runtime

##### Objectives
1. Implement AgentManifest schema
2. Create agent registry
3. Implement orchestrator
4. Implement context builder
5. Implement seed agents (start with 1-2)

##### Deliverables
- [ ] `packages/agent-runtime/src/`
  - [ ] `agent/` - Agent implementation
  - [ ] `registry.ts` - Agent registry
  - [ ] `orchestrator.ts` - Orchestrator
  - [ ] `context-builder.ts` - Context assembly
  - [ ] `memory.ts` - Memory management
  - [ ] `seeds/` - Seeded agent manifests
    - [ ] `head-legal-ai.json`
    - [ ] `legal-research-ai.json`
    - [ ] `charge-explainer-ai.json`
    - [ ] ... (all 14)
- [ ] `apps/web/` - Agent team UI
- [ ] `packages/agent-sdk/` - Complete SDK

##### Acceptance Criteria
- ✅ Agent executes structured task end-to-end
- ✅ Context assembly respects permissions
- ✅ Agent config validation works
- ✅ Orchestrator handles multi-agent tasks

#### Estimated Time: 5-7 days

---

### Phase 3 — Legal Library + RAG + Citations
**Priority:** HIGH (Dependencies: Phase 0, Phase 1, Phase 2)

#### Objectives
1. Implement authority ingestion pipeline
2. Implement chunking (legal-domain specific)
3. Implement embeddings
4. Implement hybrid retrieval
5. Implement citation system
6. Implement grounding guard

#### Deliverables
- [ ] `packages/rag/` - Complete RAG implementation
  - [ ] `ingestion/` - Document ingestion
  - [ ] `chunking.ts` - Legal-domain chunking
  - [ ] `embeddings.ts` - Embedding generation
  - [ ] `retrieval/` - Retrieval logic
    - [ ] `vector.ts` - Vector search
    - [ ] `keyword.ts` - Keyword search
    - [ ] `hybrid.ts` - Hybrid retrieval
    - [ ] `reranker.ts` - Reranking
  - [ ] `citations.ts` - Citation system
  - [ ] `grounding-guard.ts` - Grounding validation
- [ ] `packages/legal-library/` - Legal source management
  - [ ] `ingestion-pipeline.ts`
  - [ ] `source-registry.ts`
  - [ ] `authority-service.ts`
- [ ] `apps/web/` - Research workbench UI
- [ ] `tests/rag/` - RAG evaluation harness

#### Acceptance Criteria
- ✅ Research answers are grounded and clickable
- ✅ Fabrication rate 0 on golden set
- ✅ Unverified authorities render distinctly
- ✅ Guard blocks ungrounded claims

#### Estimated Time: 5-7 days

---

### Phase 4 — Case Intelligence
**Priority:** MEDIUM (Dependencies: Phase 0-3)

#### Objectives
Implement all 14 seeded agents with their structured operations:
1. Head Legal AI
2. Paralegal AI
3. Legal Research AI
4. Rights Checker AI
5. Charge Explainer AI
6. Arrest Timeline AI
7. Court Preparation AI
8. Plea Decision Assistant
9. Mitigation Builder
10. Document Analysis AI
11. Evidence Organizer AI
12. Legal Document Drafting AI
13. Case Timeline AI
14. Docket Analyst AI

#### Deliverables
- [ ] `packages/agents/` - Agent implementations
  - [ ] Each agent with:
    - [ ] Manifest (config)
    - [ ] System prompt
    - [ ] Capability implementations
    - [ ] Tool definitions
    - [ ] Tests
- [ ] Agent capability validation
- [ ] Multi-agent orchestration tests

#### Acceptance Criteria
- ✅ Each agent has tests proving declared capabilities
- ✅ Each agent has tests proving refusals
- ✅ Timeline proposals remain unverified until confirmed
- ✅ Plea assistant provably never recommends

#### Estimated Time: 7-10 days

---

### Phase 5 — Deadline Engine + Court Activity + Connector SDK
**Priority:** MEDIUM (Dependencies: Phase 0-4)

#### Objectives
1. Implement rules engine with versioned rules
2. Implement deadline computation
3. Create connector SDK
4. Implement mock court connector
5. Create Court Activity UI

#### Deliverables
- [ ] `packages/deadline-engine/`
  - [ ] `rules.ts` - Versioned rules
  - [ ] `calculator.ts` - Deadline computation
  - [ ] `explain.ts` - Explanation generation
- [ ] `packages/court-connector-sdk/`
  - [ ] `capabilities.ts` - Capability contracts
  - [ ] `adapters/` - Connector implementations
    - [ ] `mock-court.ts` - Mock connector
- [ ] `apps/web/` - Court Activity page

#### Acceptance Criteria
- ✅ Deterministic deadline math with fixtures
- ✅ `rule_not_found` handled honestly
- ✅ External action without approval impossible
- ✅ CapabilityNotVerified for undeclared capabilities

#### Estimated Time: 3-5 days

---

### Phase 6 — Document Workflow
**Priority:** MEDIUM (Dependencies: Phase 0-5)

#### Objectives
1. Implement document analysis end-to-end
2. Create template registry
3. Implement draft generation
4. Implement review/edit/approve state machine
5. Enforce AI cannot mark anything filed

#### Deliverables
- [ ] `packages/document-system/`
  - [ ] `analysis.ts` - Document analysis
  - [ ] `templates/` - Template registry
  - [ ] `drafting.ts` - Draft generation
  - [ ] `state-machine.ts` - Document state machine
- [ ] `apps/web/` - Document workspace UI

#### Acceptance Criteria
- ✅ State machine enforced and tested
- ✅ Originals never mutated
- ✅ Every draft labeled
- ✅ AI cannot transition to approved/final/filed

#### Estimated Time: 3-5 days

---

### Phase 7 — Attorney Directory
**Priority:** MEDIUM (Dependencies: Phase 0-1)

#### Objectives
1. Implement neutral directory
2. Implement provenance labels
3. Implement filters
4. Implement sponsored separation
5. Add educational content

#### Deliverables
- [ ] `packages/attorney-directory/`
  - [ ] `entities.ts` - Directory entities
  - [ ] `filters.ts` - Filter logic
  - [ ] `provenance.ts` - Provenance tracking
  - [ ] `sponsored.ts` - Sponsored content handling
- [ ] `apps/web/` - Directory UI
- [ ] Ethics/UPL review gates

#### Acceptance Criteria
- ✅ Tests prove no ranking/recommendation path exists
- ✅ Every field carries provenance
- ✅ Sponsored items labeled and separated

#### Estimated Time: 2-3 days

---

### Phase 8 — Advanced Platform
**Priority:** LOW (Dependencies: Phase 0-7)

#### Objectives
1. User-created agents with validation
2. Multi-agent orchestration at scale
3. Cross-case insights (privacy-safe)
4. Internationalization (i18n)
5. Offline/low-bandwidth modes
6. Admin console
7. Cost optimization
8. Expanded legal corpus
9. Expanded connectors

#### Deliverables
- [ ] `packages/agents/user-created/`
- [ ] `packages/orchestrator/advanced/`
- [ ] `packages/i18n/`
- [ ] `packages/offline/`
- [ ] `apps/admin/`
- [ ] Additional connectors

#### Acceptance Criteria
- ✅ User-created agents cannot exceed validation rules
- ✅ No Phase 8 feature violates any invariant
- ✅ Adversarial suite expanded accordingly

#### Estimated Time: 5-10 days

---

## 🚀 IMMEDIATE NEXT STEPS (Week 1)

### Day 1-2: Phase 0 Foundation
1. **Auth System**
   - Implement `packages/auth/src/`
   - Session management
   - JWT handling
   - MFA support

2. **Audit System**
   - Complete `packages/audit/src/`
   - Hash chain implementation
   - Audit middleware

3. **Configuration**
   - Environment variables
   - Config validation
   - Feature flags

4. **Database**
   - RLS policies for all tables
   - Migration for RLS
   - Connection pooling

### Day 3-5: Phase 1 Case Core
1. **API Endpoints**
   - Complete matters, parties, documents routes
   - Add parties, evidence, timeline, deadlines routes
   - Add sources, authorities routes

2. **Validation**
   - Zod schemas for all inputs
   - Validation middleware

3. **Authorization**
   - RLS enforcement
   - Ownership checks
   - Permission middleware

4. **UI**
   - Dashboard page
   - Cases list/create/edit
   - Documents list/upload
   - Timeline view

### Day 6-7: Phase 2 Model Gateway
1. **Model Gateway**
   - Implement ModelAdapter interface
   - Create Fake provider (for testing)
   - Create Gemini provider
   - Create Ollama provider
   - Implement routing logic

2. **Testing**
   - Unit tests for adapters
   - Integration tests for gateway
   - Adversarial tests

---

## 🛠️ MCP SERVERS UTILIZATION PLAN

The following MCP servers are available and should be leveraged:

### 1. GitHub MCP Server (`io.github.github/github-mcp-server`)
**Use Cases:**
- Check for library updates
- Search for best practices
- Review GitHub issues/discussions for patterns
- Validate dependency choices

**Integration Points:**
- CI/CD setup
- Dependency management
- Repository analysis

### 2. Next.js DevTools MCP (`io.github.vercel/next-devtools-mcp`)
**Use Cases:**
- Next.js best practices
- Performance optimization
- Debugging Next.js apps
- Server components guidance

**Integration Points:**
- `apps/web/` optimization
- API routes configuration
- Static generation strategies

### 3. Chrome DevTools MCP (`io.github.ChromeDevTools/chrome-devtools-mcp`)
**Use Cases:**
- Frontend debugging
- Performance profiling
- Accessibility testing
- Network analysis

**Integration Points:**
- UI testing
- Performance monitoring
- WCAG 2.2 AA compliance checking

### 4. Playwright MCP (`microsoft/playwright-mcp`)
**Use Cases:**
- End-to-end testing
- Component testing
- Accessibility testing
- Cross-browser testing

**Integration Points:**
- Test suite for all phases
- Adversarial testing
- E2E test generation

### 5. Vercel MCP (`com.vercel/vercel-mcp`)
**Use Cases:**
- Deployment configuration
- Environment setup
- Preview deployments
- Monitoring

**Integration Points:**
- CI/CD pipeline
- Deployment strategies
- Environment variables

### 6. Hugging Face MCP (`huggingface/hf-mcp-server`)
**Use Cases:**
- Model information lookup
- Embedding models
- Legal domain models
- Benchmarking

**Integration Points:**
- Model selection
- Embedding configuration
- Local model options

### 7. DebugAI MCP (`debugai`)
**Use Cases:**
- Code debugging
- Error analysis
- Performance profiling
- Test case generation

**Integration Points:**
- Development workflow
- Error handling
- Test debugging

### 8. Desktop Commander MCP (`io.github.wonderwhy-er/desktop-commander`)
**Use Cases:**
- File system operations
- Process management
- Terminal commands
- Development environment setup

**Integration Points:**
- Local development
- Build processes
- Dependency installation

### 9. Filesystem MCP (`filesystem`)
**Use Cases:**
- File access and manipulation
- Repository analysis
- Code search
- File generation

**Integration Points:**
- All code generation tasks
- File management
- Repository navigation

---

## 📋 CAPABILITY-NOT-VERIFIED REGISTER

Track unverified capabilities here:

| ID | Capability | Status | Notes | Verification Plan |
|----|------------|--------|-------|------------------|
| CNV-001 | Court API integrations | Unverified | Need to identify available court APIs | Research per jurisdiction |
| CNV-002 | Legal authority sources | Partial | Some sources identified | Ingest Tier 1/2 sources |
| CNV-003 | Embedding model costs | Needs verification | Check current pricing | Verify with providers |
| CNV-004 | Token limits per model | Needs verification | Check current limits | Verify with providers |

---

## 🎯 SUCCESS METRICS

### Phase 0
- [ ] 100% of authentication flows tested
- [ ] 100% of authorization checks in place
- [ ] Audit log append-only proven
- [ ] CI/CD pipeline green

### Phase 1
- [ ] All domain entities have CRUD
- [ ] All endpoints validated
- [ ] All endpoints authorized
- [ ] OpenAPI spec complete

### Phase 2
- [ ] Model Gateway handles all provider types
- [ ] Agent Runtime executes all seeded agents
- [ ] Full audit trail for all AI operations

### Phase 3
- [ ] RAG pipeline end-to-end
- [ ] Citation system working
- [ ] Fabrication rate < 1%

### Phase 4+
- [ ] All 14 agents implemented and tested
- [ ] All invariants enforced
- [ ] Adversarial suite passes

---

## 📅 SUGGESTED TIMELINE

### Week 1-2: Foundation (Phase 0-1)
- Auth, Audit, Config, CI/CD
- Complete Case Core

### Week 3-4: AI Infrastructure (Phase 2)
- Model Gateway
- Agent Runtime
- Seeded Agents (2-3)

### Week 5-6: Legal Intelligence (Phase 3-4)
- RAG Pipeline
- Citation System
- All 14 Seeded Agents

### Week 7-8: Advanced Features (Phase 5-6)
- Deadline Engine
- Document Workflow
- Attorney Directory

### Week 9-10: Polish & Scale (Phase 7-8)
- User-created agents
- Multi-agent orchestration
- Admin console
- Performance optimization

---

## ✅ CHECKLIST FOR EXECUTOR

- [ ] Read full Master Implementation Prompt
- [ ] Understand all invariants (§2)
- [ ] Understand definition of "done" (§1.2)
- [ ] Review anti-patterns (§31)
- [ ] Build in phase order (§30)
- [ ] Never cross boundary walls (§2)
- [ ] Always test adversarially (§25.6)
- [ ] Always preserve provenance (§10-11)
- [ ] Always require human approval for external actions (§9.5)

---

## 📚 REFERENCES

1. **Master Implementation Prompt**: `/home/andrew/Downloads/Chain_of_Command_Master_Implementation_Prompt.md`
2. **Project Repository**: `/home/andrew/Development/Repos/Chain-of-Command/`
3. **AGENTS.md**: Project-specific instructions
4. **MCP Configuration**: `~/.config/Code/User/mcp.json`

---

**Document Status**: Living document - update as progress is made  
**Next Review**: After Phase 0 completion  
**Owner**: AI Executor with MCP Server Access
