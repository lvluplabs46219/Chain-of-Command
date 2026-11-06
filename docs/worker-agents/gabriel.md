# Gabriel — Patch Generation & Messenger Worker

**Plane:** `out_of_app`  
**Role:** Patch generator + messenger / delivery

## Purpose

Gabriel receives the diagnostic matrix from Seraphim and produces concrete code repairs. It also handles notification and delivery of results within the worker mesh.

It does **not** perform final verification or policy approval, and it is never shown to litigants.

## Responsibilities

- Analyze the diagnostic matrix
- Identify known fixable patterns (or call an LLM for more complex cases)
- Generate the patched source
- Return a structured patch payload:
  - `applied`: list of fixes applied
  - `description`
  - `source`: full patched source (when applicable)
  - `issues`
- Notify other workers or systems when required

## Typical Input → Output

**Input:** Diagnostic matrix from Seraphim  
**Output:** Patch info dict consumed by Michael

## Implementation Notes

- Reference implementation: `divine-agent-architecture/agents/gabriel.py`
- In the TypeScript mesh: handles `code.patch`, `notify`, and related task kinds

## Boundaries

- Does not run the verification suite (that is Michael)
- Does not make final approve/reject decisions (that is YHWH)
- Must not be listed in any in-app agent roster
