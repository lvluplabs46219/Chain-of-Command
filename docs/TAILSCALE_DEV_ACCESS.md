# Acquit.ai — Private Development Access with Tailscale

This is the recommended development path for viewing the local Acquit web app from another trusted device without publishing the dev server to the public internet.

## 1. Start the web app locally

From the repository root:

```bash
cd ~/Development/Repos/Aquit-Platform
cd apps/web
bun install
bun run dev
```

The Vite dev server listens on port `3000` according to `apps/web/package.json`.

## 2. Confirm Tailscale is connected

```bash
tailscale status
```

Make sure the development workstation and the device you want to use for testing are in the same tailnet.

## 3. Publish the local web server privately to the tailnet

Use Tailscale Serve to proxy the local Vite server through the workstation's tailnet identity. Do **not** use Tailscale Funnel for this development workflow.

```bash
tailscale serve --bg http://127.0.0.1:3000
```

Then inspect the active Serve configuration:

```bash
tailscale serve status
```

Open the generated `https://<machine>.<tailnet>.ts.net` address from another authorized tailnet device.

## 4. Stop the private dev endpoint

```bash
tailscale serve reset
```

This removes the Serve configuration from the workstation.

## Security rules

- Keep development endpoints tailnet-only.
- Never put Supabase service-role keys, database passwords, or other secrets into Vite client environment variables.
- Do not use Funnel for Acquit development unless a public endpoint is explicitly required and separately reviewed.
- Treat case data and uploaded legal documents as sensitive; use test fixtures when exposing a development UI to another device.
- Tailscale provides network access; application authentication and authorization remain required inside Acquit.

## Current integration boundary

Tailscale is being used as a **private developer access layer**, not as a replacement for Acquit authentication, Supabase RLS, or application-level authorization.
