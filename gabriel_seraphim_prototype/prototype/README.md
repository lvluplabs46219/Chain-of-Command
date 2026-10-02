# Gabriel-Code / Seraphim Minimal Working Prototype

This is a self-contained, runnable demonstration of the four-phase automated build → test → scan → patch pipeline described in the design document.

## What it demonstrates

1. **Stage 1 – Build & Compilation**
   - Mock toolchain / lockfile check
   - Ruff + mypy on the Python sample
   - `tsc --noEmit` on a small TypeScript file (intentionally contains a type error)
   - Mock container build (no Docker in the sandbox)

2. **Stage 2 – Runtime Debugging & Failure Extraction**
   - Runs `pytest` against deliberately failing tests
   - Produces a `DebugContext` JSON (stack trace, test name, environment)

3. **Stage 3 – Vulnerability & Bug Scanning**
   - Bandit SAST (detects `eval`)
   - Mock Trivy / Gitleaks
   - Seraphim Bot (AST-based forbidden-call detection + template heuristics)

4. **Stage 4 – Automated Patch Generation & Verification**
   - Gabriel-Code Bot (rule-based) produces a unified-diff style patch for known bugs:
     - broken `reverse_list`
     - missing zero-check in `safe_divide`
     - unsafe `eval` in `process_user_input`
   - Seraphim audits the patch
   - Patch is applied in an isolated temporary directory and tests are re-run
   - On success the fixed sources are written under `artifacts/fixed_sample_app/`

## Quick start

```bash
cd prototype
./run_prototype.sh
# or
python3 pipeline/orchestrator.py
```

## Layout

```
prototype/
├── sample_app/          # Intentionally buggy application + tests
├── pipeline/
│   ├── orchestrator.py
│   ├── stage1_lint_build.py
│   ├── stage2_debug_extract.py
│   ├── stage3_scan.py
│   ├── stage4_patch_loop.py
│   └── bots/
│       ├── gabriel.py   # Patch generator
│       └── seraphim.py  # Guardrail auditor
├── artifacts/           # All reports, patches, fixed sources
└── run_prototype.sh
```

## Limitations (by design for “minimal”)

- No real Docker / Trivy / Gitleaks / Semgrep binaries
- Gabriel is rule-based, not an LLM agent
- Patch application is simplified (string replace of known blocks)
- No real Git commit / PR creation
- TypeScript type error is reported but not auto-patched

These constraints keep the prototype fully executable inside the provided sandbox while still exercising every major control-flow path of the original design.
