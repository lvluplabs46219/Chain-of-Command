# YHWH — Policy Governance Worker

**Plane:** `out_of_app`  
**Role:** Final policy gate / approval authority

## Purpose

YHWH is the last gate before any change is committed or merged. It evaluates both the verification results from Michael and a set of hard safety rules. Only if both pass does it grant approval.

This agent is the ultimate local reasoning and policy authority for the worker plane.

## Responsibilities

- Reject any patch that failed verification (`verified !== true`)
- Scan proposed source for forbidden patterns (`eval(`, `exec(`, `__import__(`, `os.system(`, etc.) while allowing known-safe alternatives (e.g. `ast.parse`)
- Block modifications to forbidden files (`.env`, `dev.env`, credential files, itself, etc.)
- Issue a clear approve / reject decision

## Typical Input → Output

**Input:**
- Patch info from Gabriel
- Verification result from Michael

**Output:** Boolean approval (`true` = may proceed to commit/merge)

## Implementation Notes

- Reference implementation: `divine-agent-architecture/agents/yhwh.py`
- In the TypeScript mesh: handles `llm.reason` and `code.approve` style task kinds

## Boundaries

- Does not generate or apply patches
- Does not run the test suite itself
- Has absolute veto power over the worker pipeline
- Never exposed to litigants or listed as counsel
