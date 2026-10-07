# Automated Build & Patch Generation Pipeline

## 1. Automated Build & Compilation Phase

```text
[ Source Code Commit / Trigger ]
               │
               ▼
┌──────────────────────────────────────────────┐
│  Stage 1.1: Environment & Toolchain Sync     │
│  • Isolated version managers (NVM, Pyenv)    │
│  • Lockfile validation (pnpm-lock / poetry)  │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Stage 1.2: Static Typing & Linting          │
│  • TypeScript: `tsc --noEmit`                │
│  • Python: `mypy` & `ruff check`             │
│  • AST Syntax Tree Parsing                   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Stage 1.3: Multi-Stage Container Build      │
│  • Parallel Docker / OCI Container Layering  │
│  • Artifact Bundling (Next.js / FastAPI)     │
└──────────────────────────────────────────────┘
```

* **Execution Driver**: Local runner or GitHub Actions CI worker.
* **Failure Gate**: Any type error, syntax failure, or broken dependency lock halts the pipeline instantly and generates a structured error object.

---

## 2. Runtime Debugging & Failure Extraction Phase

```text
[ Build Artifacts ] ──► [ Vitest / Pytest Execution Engine ]
                                     │
                             (On Test Failure)
                                     │
                                     ▼
                     ┌───────────────────────────────┐
                     │   Automated Trace Extraction  │
                     │  • Stack Trace Normalization  │
                     │  • Memory & Heap Dump Capture │
                     │  • Environment Context Sync   │
                     └───────────────┬───────────────┘
                                     │
                                     ▼
                     ┌───────────────────────────────┐
                     │    Gabriel-Code Bot Ingest    │
                     │  • Localizes File & Line #    │
                     │  • Pulls Surrounding AST      │
                     └───────────────────────────────┘
```

* **Automated Debug Flow**:
  * Test runner (vitest for React/Next.js, pytest for FastAPI/Juriscraper) executes unit, integration, and API contract suites.
  * If an assertion fails or an uncaught exception is thrown, the runner serializes the stack trace, variable values at runtime, and failing input parameters into a `DebugContext` JSON payload.
  * `Gabriel-Code Bot` ingests `DebugContext`, isolates the precise function and line number, and constructs a localized dependency sub-graph to pinpoint the root cause.

---

## 3. Vulnerability & Bug Scanning Engine

```text
                                  [ Compiled Code & Containers ]
                                                 │
      ┌──────────────────────────────────────────┼──────────────────────────────────────────┐
      ▼                                          ▼                                          ▼
┌─────────────────────────────┐        ┌────────────────────────────┐        ┌──────────────────────────────┐
│  Static Analysis (SAST)     │        │  Dependency & Secret Scan  │        │  Guardrail & Prompt Audit    │
│ • Semgrep rules for legal   │        │ • Trivy / Docker Scout     │        │ • Seraphim Bot Audit         │
│   data leaks                │        │ • Gitleaks secret detection│        │ • Template injection checks  │
│ • SQL injection / ORM leaks │        │ • Dependency CVE checks    │        │ • Data sensitivity flags     │
└──────────────┬──────────────┘        └─────────────┬──────────────┘        └──────────────┬───────────────┘
               │                                     │                                      │
               └─────────────────────────────────────┼──────────────────────────────────────┘
                                                     │
                                                     ▼
                                     ┌──────────────────────────────┐
                                     │ Unified Vulnerability Matrix │
                                     └──────────────────────────────┘
```

* **Scanning Tools & Coverage**:
  * **SAST (Static Application Security Testing)**: Semgrep and Bandit analyze source code for insecure pattern usage, unsafe dynamic evaluations, and SQL/Cypher query injection vectors.
  * **Secret & CVE Detection**: Trivy or Docker Scout scans container images and package trees for known vulnerabilities and hardcoded API credentials.
  * **Agentic Guardrail Scan (Seraphim Bot)**: Inspects prompt dynamic templates (e.g., `TemplateEngine.render()`) for unescaped untrusted variables (`{{...}}`) that could lead to indirect prompt injection or credential exfiltration.

---

## 4. Automated Patch Generation & Verification Loop

```text
                       [ Unified Vulnerability / Bug Matrix ]
                                         │
                                         ▼
                       ┌───────────────────────────────────┐
                       │        Gabriel-Code Bot           │
                       │ • Generates Minimal Git Patch     │
                       │ • Modifies AST Nodes              │
                       └─────────────────┬─────────────────┘
                                         │
                                         ▼
                       ┌───────────────────────────────────┐
                       │          Seraphim Bot             │
                       │ • Inspects Patch for New Leaks    │
                       │ • Validates Escaping Rules        │
                       └─────────────────┬─────────────────┘
                                         │
                                         ▼
                       ┌───────────────────────────────────┐
                       │     Isolated Sandbox Test         │
                       │ • Re-runs Failed Tests            │
                       │ • Verifies Regression Suite       │
                       └─────────────────┬─────────────────┘
                                         │
                         ┌───────────────┴───────────────┐
                         │ (Pass)                        │ (Fail)
                         ▼                               ▼
        ┌────────────────────────────────┐     ┌───────────────────┐
        │ Commit Patch / Auto-Merge PR   │     │ Escalates to YHWH │
        └────────────────────────────────┘     └───────────────────┘
```

* **Remediation Loop Steps**:
  * **Patch Generation**: `Gabriel-Code Bot` receives the bug/vulnerability report and writes a targeted Git diff fixing the bug or escaping the unsafe variable.
  * **Security Audit**: `Seraphim Bot` performs real-time payload inspection on the generated patch code to ensure it does not introduce secondary vulnerabilities or bypass existing authorization logic.
  * **Sandbox Validation**: The pipeline executes the generated patch in an isolated temporary container, re-running the specific failed test along with the entire regression test suite.
  * **Automated Resolution**: If all tests pass, the patch is automatically committed to the branch or merged via a PR. If it fails, the execution loop increments its retry counter and re-routes the failure context back to `YHWH` for logical plan modification.
