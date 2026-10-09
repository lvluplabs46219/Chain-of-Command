# Infisical Agent — Chain of Command

Daemon that authenticates as a **machine identity** and renders secrets into files
for the app (and multi-agent runtime) to read.

Instance: https://app.infisical.com  
Org: LvlUpLabs

## Prerequisites

1. Infisical CLI installed (`infisical version` — already on this machine).
2. Project **chain-of-command** exists in Infisical (or change slug in agent-config.yaml).
3. Secrets live under environment `dev` (and optionally `staging`) at path `/`.

## Create machine identity (one-time UI)

1. Open https://app.infisical.com → **Access Control** → **Machine Identities**.
2. Create identity named `coc-agent` (or similar).
3. Assign a role with **read** on project `chain-of-command` (Viewer or custom).
4. Under **Universal Auth**, create a **Client Secret**.
5. Copy Client ID + Client Secret.

## Install credentials on this machine

```bash
printf '%s' "YOUR_CLIENT_ID"     > ~/.config/coc-infisical/client-id
printf '%s' "YOUR_CLIENT_SECRET" > ~/.config/coc-infisical/client-secret
chmod 600 ~/.config/coc-infisical/client-id ~/.config/coc-infisical/client-secret
```

## Run agent

**Foreground:**
```bash
cd ~/Development/Repos/Chain-of-Command
infisical agent --config config/infisical/agent-config.yaml
```

**systemd (user):**
```bash
systemctl --user daemon-reload
systemctl --user enable --now coc-infisical-agent.service
systemctl --user status coc-infisical-agent.service
journalctl --user -u coc-infisical-agent.service -f
```

## Outputs

| Path | Content |
|------|--------|
| `~/.local/state/coc/secrets/access-token` | Short-lived Infisical access token |
| `~/.local/state/coc/secrets/.env` | Rendered KEY=VALUE secrets (dev) |
| `~/.local/state/coc/secrets/.env.staging` | Rendered secrets (staging) |

Symlink or source into the app:

```bash
# Option A: symlink repo root .env (careful — do not commit)
ln -sfn ~/.local/state/coc/secrets/.env ~/Development/Repos/Chain-of-Command/.env

# Option B: load in shell before npm run dev
set -a; source ~/.local/state/coc/secrets/.env; set +a
```

The API already has `apps/api/src/lib/infisical.ts` which can also pull via
Universal Auth using `INFISICAL_CLIENT_ID` / `INFISICAL_CLIENT_SECRET` in process.env.
The agent is the preferred path for file-based injection and token renewal.

## Base64 config (no file)

```bash
export INFISICAL_AGENT_CONFIG_BASE64="$(base64 -w0 config/infisical/agent-config.yaml)"
infisical agent
```
