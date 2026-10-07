# Security Policy — Chain of Command Legal OS

## Supported versions

| Branch / channel | Supported |
| ---------------- | --------- |
| `main` (production) | Yes |
| Preview / feature branches | Best-effort |
| Archived tags | No |

## Reporting a vulnerability

**Do not open a public GitHub issue for security-sensitive reports.**

Email: **security@lvluplabs.com** (or the address listed in the org profile)  
Include: affected component, reproduction steps, impact, and whether data may have been exposed.

You should receive an acknowledgment within **5 business days**. We aim to provide a remediation plan or status update within **14 days** for confirmed high/critical issues.

## Coordinated disclosure

Please allow reasonable time for a fix before public disclosure. We will credit researchers who report in good faith unless they prefer anonymity.

## Hard rules for this product

- No silent mock databases in production paths.
- No unverified demo bearer tokens in `NODE_ENV=production`.
- Matter and document access must be ownership-scoped.
- Human-gated filing only (no autonomous court submission).
- Secrets never belong in git history, chats, or client bundles.

## Credential rotation

If a secret is pasted into chat, logs, or a PR, **rotate it immediately** in the provider dashboard (Supabase, OpenAI, Vercel, etc.) and update environment variables only via the host secrets store.
