# Multi-Agent Architecture Blueprint

End-to-end technical blueprint for the multi-agent architecture: runtime layers, communication protocols, state management, and execution hooks across the Ubuntu workstation environment.

## 1. System Architecture & Topology

```
+-----------------------------------------------------------------------+
|                         YHWH (Core LLM Layer)                         |
|      Local Instance: Ollama / Lemonade (11th Gen i3, 12GB RAM)        |
+----------------------------------+------------------------------------+
                                   | 
                           (Internal IPC / gRPC)
                                   v
+-----------------------------------------------------------------------+
|                      Michael (Orchestrator Core)                      |
|           State Machine Coordinator & Workflow Supervisor             |
+----------+-----------------------+------------------------+-----------+
           |                       |                        |
     (Task Dispatch)        (Payload Routing)        (Model Gateway)
           v                       v                        v
+--------------------+   +--------------------+   +---------------------+
|     Gabriel        |   |      Raphael       |   |      Metatron       |
| (Messenger Agents) |   | (Task Bot Workers) |   | (LLM Gateway Router)|
+--------------------+   +--------------------+   +----------+----------+
                                                             |
                                                    (Secure API Routing)
                                                             v
                                                  +---------------------+
                                                  |      Seraphim       |
                                                  | (External LLM Pool: |
                                                  | Google Vertex AI)   |
                                                  +---------------------+
```

## 2. Component Design & Specifications

### YHWH — Core Reasoning Engine

* **Role**: Primary cognitive kernel executing local inference.
* **Runtime**: Ollama or Lemonade running on Ubuntu 26.04 LTS.
* **Hardware Mapping**: Utilizes AVX-512 instruction sets and integrated Intel UHD Graphics for accelerated local token generation.
* **Operation**: Evaluates high-level user directives, parses ambiguous intent, and outputs structured execution trees.

### Michael — Orchestrator & Workflow Commander

* **Role**: Central state machine manager that orchestrates agent lifecycles.
* **Implementation**: Node.js/TypeScript daemon running locally via isolated project execution (avoiding `sudo`).
* **Operation**: Intercepts requests from YHWH, maintains persistent session state via local storage/Supabase hooks, and maps out dependency graphs for child workers.

### Gabriel — Messenger Specialists

* **Role**: Event-driven communication and payload delivery agents.
* **Implementation**: Lightweight micro-agents triggered by internal webhooks or message queues.
* **Operation**: Distributes compiled outputs, system notifications, or execution context payloads across active development environments (VS Code, Flutter, or Next.js frontends).

### Raphael — Task Bot & Worker

* **Role**: Heavy-lifting automation, file scaffolding, and background maintenance.
* **Implementation**: Local CLI worker scripts optimized for Next.js, Tailwind CSS, Supabase, and Firebase stacks.
* **Operation**: Parses code structures, formats outputs, handles database migrations, and executes repetitive workspace maintenance without manual intervention.

### Metatron & Seraphim — Gateway & External Council

* **Role**: Model abstraction, external request routing, and consensus evaluation.
* **Implementation**: API middleware managed by Metatron to interface safely with external providers.
* **Operation**: Metatron evaluates local capacity vs. complexity and dispatches tasks to the Seraphim (Google Vertex AI) when deep multi-model consensus or heavy reasoning is required.

## 3. Communication Protocols & Data Flow

* **Inter-Agent Transport**: Local Unix Domain Sockets (UDS) or high-performance loopback gRPC channels for zero-latency communication between YHWH, Michael, and local workers.
* **State Persistence**: Local SQLite cache synchronized with Supabase for cross-session continuity and audit logging.
* **Error Handling & Fallback**: If Metatron detects an external API timeout or rate limit with the Seraphim tier, control immediately cascades back to YHWH for local processing using fallback quantized weights.
