## Summary

## Definition of Done (Master Prompt §1.2)

- [ ] Happy path works; ≥3 adversarial paths fail safely
- [ ] Typed end-to-end; any `any` justified
- [ ] External inputs validated
- [ ] Server-side authorization on every read/write
- [ ] Audit event for significant state changes / AI ops
- [ ] Model/retrieved content never treated as instructions
- [ ] Provenance for legal claims (or explicitly unverified)
- [ ] Tests for touched surfaces
- [ ] Migrations / docs updated if needed
- [ ] Assumptions & unverified capabilities listed

## Security

- [ ] No demo tokens accepted in production paths
- [ ] No secrets in diff
- [ ] Ownership scoped for tenant/case data
