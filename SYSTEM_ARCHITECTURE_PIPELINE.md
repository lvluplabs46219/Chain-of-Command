# System Architecture Pipeline Blueprint

This 4-worker execution topology establishes a decoupled domain-execution model with dedicated real-time guardrail interception.

## Core Pipeline Dataflow

* **Ingress & Prompt Synthesis**: Incoming requests hit **Metatron** for dynamic prompt transformation and context wrapping, then pass to **YHWH** for high-level reasoning and decision-tree resolution.
* **State & Dispatch Allocation**: **Michael** updates the core execution state machine and issues raw subtasks to **Raphael**.
* **Guardrail Interception (Pre-Execution)**: **Seraphim Bot** intercepts candidate payloads before worker execution to check for prompt injection, sensitive data leakage, or policy violations.
* **Parallel Worker Fan-Out**: Approved subtasks dispatch concurrently across domain-specific workers:
  * **Gabriel-Research Bot**: Ingests legal documents, queries vector indexes (pgvector/OpenSearch), and scrapes external endpoints via Juriscraper/APIs.
  * **Gabriel-Code Bot**: Generates, refactors, and runs static analysis on system code, SQL migrations, or API contracts.
  * **Gabriel-Data Bot**: Executes schema transforms, standardizes incoming JSON/XML datasets, and handles CDC/ETL operations.
* **Payload Inspection & Response Aggregation (Post-Execution)**: Output streams from Gabriel workers re-pass through **Seraphim Bot** for payload sanitization before **Raphael** aggregates the results and returns the unified state to **Michael**.

## Architectural Considerations & Optimization Points

* **Seraphim as Inline Middleware vs. Async Sidecar**: Running Seraphim inline guarantees total payload safety, but adds latency to every worker turn. For latency-critical streams (e.g., direct UI tokens), streaming payloads through Seraphim via a real-time sliding window inspector prevents bottlenecking.
* **Gabriel Worker Fault Tolerance**: If Gabriel-Research encounters an upstream endpoint timeout or parsing error during bulk ingestion, Michael must maintain an isolated worker retry state without invalidating concurrent tasks running on Gabriel-Code or Gabriel-Data.
* **Sub-Agent Context Isolation**: Each Gabriel worker should only receive minimized context relevant to its execution domain to prevent unnecessary token consumption and lower the attack surface for indirect prompt injections embedded in ingested legal documents.

---

## System Architecture Pipeline Blueprint

```text
                      [ External Client Request / Trigger ]
                                        │
                                        ▼
             ┌─────────────────────────────────────────────────────┐
             │  Metatron (Gateway Router & Prompt Transformer)     │
             │  • Dynamic Context Injection                        │
             │  • Model Routing (llama.cpp / Cloud LLMs)          │
             └──────────────────────────┬──────────────────────────┘
                                        │
                                        ▼
             ┌─────────────────────────────────────────────────────┐
             │  YHWH (Root System Controller & LLM Reasoning Core) │
             │  • Task Decomposition & Logical Planning            │
             │  • Strategy Assignment                              │
             └──────────────────────────┬──────────────────────────┘
                                        │
                                        ▼
             ┌─────────────────────────────────────────────────────┐
             │  Michael (Master Orchestrator & State Manager)      │
             │  • Maintains Global Execution Graph                 │
             │  • State Machine Transitions & Retry Strategy       │
             └──────────────────────────┬──────────────────────────┘
                                        │
                                        ▼
             ┌─────────────────────────────────────────────────────┐
             │  Raphael (Parallel Task Dispatcher & Aggregator)    │
             │  • Task Fan-Out & Message Queue Publishing          │
             └──────────────────────────┬──────────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                  Seraphim Bot (Pre-Execution Interceptor)                    │
│ • Payload Validation • Prompt Injection Shielding • Policy Audit Compliance  │
└───────┬───────────────────────────────┬──────────────────────────────┬───────┘
        │ (Approved)                    │ (Approved)                   │ (Approved)
        ▼                               ▼                              ▼
┌──────────────────────────────┐ ┌──────────────────────────┐ ┌──────────────────────────────┐
│     Gabriel-Research Bot     │ │     Gabriel-Code Bot     │ │      Gabriel-Data Bot        │
│ • Document Ingestion (CAP)   │ │ • Code/SQL Generation    │ │ • Schema Transformations     │
│ • Hybrid Search & RAG        │ │ • Static Analysis        │ │ • AST Refactoring        │ │ • ETL / Logical Replication  │
│ • Eyecite / Juriscraper      │ │ • CDC Pipelines              │
└──────────────┬───────────────┘ └────────────┬─────────────┘ └──────────────┬───────────────┘
               │                             │                              │
               └─────────────────────────────┼──────────────────────────────┘
                                             │
                                             ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                 Seraphim Bot (Post-Execution Interceptor)                    │
│ • Output Sanitization • Data Leakage Audit • Context Escaping Checks        │
└────────────────────────────────────────────┬─────────────────────────────────┘
                                             │
                                             ▼
             ┌─────────────────────────────────────────────────────┐
             │  Raphael (Parallel Task Dispatcher & Aggregator)    │
             │  • Response Aggregation & Stream Join               │
             └──────────────────────────┬──────────────────────────┘
                                        │
                                        ▼
             ┌─────────────────────────────────────────────────────┐
             │  Michael (Master Orchestrator & State Manager)      │
             │  • State Resolution & Final Event Commitment        │
             └──────────────────────────┬──────────────────────────┘
                                        │
                                        ▼
                          [ Formatted Output Stream ]
```

## Step-by-Step Execution Workflow

### Phase 1: Ingress, Reasoning & State Initialization
* **Request Ingestion (Metatron)**:
  * Ingests the client payload or API request.
  * Runs dynamic prompt transformation, injects baseline system directives, and routes model inference calls to local llama.cpp instances or upstream cloud LLM providers depending on task priority and context size.
* **Task Planning (YHWH)**:
  * Analyzes the high-level request and breaks complex objectives into discrete, isolated subtasks.
  * Generates a Directed Acyclic Graph (DAG) specifying dependencies between research, code generation, and data transformations.
* **State Registration (Michael)**:
  * Registers the active execution pipeline with a unique `execution_id`.
  * Sets up individual subtask states (PENDING, RUNNING, FAILED, COMPLETED) in memory or PostgreSQL state persistence.

### Phase 2: Dispatch & Security Interception
* **Task Fan-Out (Raphael)**:
  * Reads the dependencies from Michael and dispatches ready tasks concurrently into worker queue channels.
* **Pre-Execution Guardrails (Seraphim Bot)**:
  * Intercepts queued payloads prior to execution.
  * Inspects prompt text for indirect prompt injection techniques embedded in legal or external data sources.
  * Checks security policies and data sensitivity parameters; drops or redacts forbidden fields.

### Phase 3: Parallel Domain Execution
Approved tasks execute in isolation across the dedicated Gabriel worker bots:
* **Gabriel-Research Bot**:
  * Executes external lookups via Juriscraper, queries public datasets (CAP/CourtListener), or runs hybrid vector/BM25 lookups over PostgreSQL (pgvector).
  * Runs eyecite to parse and extract citation references from legal text.
* **Gabriel-Code Bot**:
  * Synthesizes source code, structural schemas, or SQL migration scripts.
  * Conducts local AST parsing and static analysis to ensure syntactical validity before passing code downstream.
* **Gabriel-Data Bot**:
  * Executes CDC, JSON/XML mapping, and batch ETL processes.
  * Standardizes raw legal/document structures into unified relational schemas for database ingestion.

### Phase 4: Output Sanitization & Result Synthesis
* **Post-Execution Guardrails (Seraphim Bot)**:
  * Scans generated outputs from all Gabriel bots for sensitive configuration details, exposed API keys, or unsanitized user inputs.
  * Ensures output string escaping (preventing template injection if rendering down the pipeline).
* **Result Aggregation (Raphael)**:
  * Collects validated subtask responses, resolving asynchronous dependencies.
  * Returns complete payloads to Michael.
* **State Resolution (Michael)**:
  * Updates state entries to COMPLETED.
  * Triggers downstream steps if the DAG has dependent subtasks, or finalizes execution and outputs the combined response to the caller.

## Core Data Payload Schemas

### Dispatch Task Contract (`Raphael -> Seraphim -> Gabriel Worker`)
```json
{
  "task_id": "tsk_8f9a2b10-3c4d-4e5f-a6b7-c8d9e0f1a2b3",
  "execution_id": "exec_12345678-90ab-cdef-1234-567890abcdef",
  "assigned_worker": "gabriel-research",
  "data_sensitivity": "confidential",
  "payload": {
    "action": "extract_citations",
    "source_text": "347 U.S. 483, 490 (1954)",
    "parameters": {
      "extract_context": true,
      "context_window": 250
    }
  },
  "metadata": {
    "retries": 0,
    "max_retries": 3,
    "timeout_ms": 5000
  }
}
```

### Worker Result & Guardrail Output Contract (`Gabriel Worker -> Seraphim -> Raphael`)
```json
{
  "task_id": "tsk_8f9a2b10-3c4d-4e5f-a6b7-c8d9e0f1a2b3",
  "execution_id": "exec_12345678-90ab-cdef-1234-567890abcdef",
  "worker_status": "SUCCESS",
  "guardrail_status": "PASSED",
  "result": {
    "citations_found": 1,
    "citations": [
      {
        "raw_text": "347 U.S. 483, 490",
        "reporter": "U.S.",
        "volume": 347,
        "page": 483,
        "pinpoint": 490
      }
    ]
  },
  "sanitized": true
}
```
