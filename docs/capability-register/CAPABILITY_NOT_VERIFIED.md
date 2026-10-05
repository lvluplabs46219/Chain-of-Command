# Capability-Not-Verified Register

Living document per Master Implementation Prompt v2.0 Appendix H.
Never fabricate a resolution. Append every capability that cannot be confirmed.

| # | Capability / assumption | Status | What would verify it | Owner | Impact if wrong |
|---|-------------------------|--------|----------------------|-------|-----------------|
| 1 | A specific court's electronic filing API | **Capability not verified** | Official court/publisher documentation, permitted access terms | Build lead | Auto-filing must remain disabled |
| 2 | Current provider model IDs, context limits, pricing | **Must re-verify at build time** | Provider's current official docs (read at implementation time) | AI eng | Routing/budget errors |
| 3 | Provider no-training / retention guarantees | **Must re-verify per contract** | Provider's current data-use documentation + agreement | Privacy lead | Data-handling risk |
| 4 | Grounding tools combined with structured output on the chosen models | **Must re-verify at build time** | Provider docs for the selected models | AI eng | Grounded structured output may need a two-step pipeline |
| 5 | Official court forms corpus licensing | **Capability not verified** | Publisher license/terms | Legal/compliance | Cannot ship official forms |
| 6 | UPL posture per target jurisdiction | **Must be reviewed by counsel** | Jurisdiction-specific legal review | Counsel | Feature may need to be disabled per jurisdiction |
| 7 | Attorney bar/regulator data feeds | **Capability not verified** | Official source terms/API | Dir. lead | Directory falls back to attorney-provided data |

## How to append

When implementation encounters an unverified capability:

1. Do **not** invent the integration.
2. Produce the interface and configuration seam.
3. Add a row here with status **Capability not verified**.
4. Surface `CAPABILITY_NOT_VERIFIED` to the user when the feature is invoked.
