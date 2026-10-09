# Infisical setup (Chain of Command)

Instance: **https://app.infisical.com**  
Org (this machine profile): **LvlUpLabs**

The Infisical Agent authenticates as a **machine identity** and renders secrets into files under `~/.local/state/coc/secrets/`.

## Why you see this error

```
unable to read file content from file path '/home/andrew/.config/coc-infisical/client-id'
```

The agent config is correct. The **Client ID / Client Secret files were never written**. Create a machine identity in the UI, then install the credentials locally.

## One-time: create machine identity

1. Open [app.infisical.com](https://app.infisical.com) → **Access Control** → **Machine Identities**.
2. Create identity e.g. `coc-agent`.
3. Grant **read** on project **chain-of-command** (or your real project slug — must match templates in `config/infisical/agent-config.yaml`).
4. **Universal Auth** → create **Client Secret**.
5. Copy **Client ID** and **Client Secret**.

## Install credentials (this machine)

```bash
mkdir -p ~/.config/coc-infisical ~/.local/state/coc/secrets
chmod 700 ~/.config/coc-infisical ~/.local/state/coc/secrets

printf '%s' "PASTE_CLIENT_ID_HERE"     > ~/.config/coc-infisical/client-id
printf '%s' "PASTE_CLIENT_SECRET_HERE" > ~/.config/coc-infisical/client-secret
chmod 600 ~/.config/coc-infisical/client-id ~/.config/coc-infisical/client-secret
```

Do **not** commit these files. They live only under `~/.config/`.

## Run the agent

From repo root (`~/Development/Repos/Chain-of-Command`):

```bash
infisical agent
# or
npm run secrets:agent
# or explicit path
infisical agent --config config/infisical/agent-config.yaml
```

Root `agent-config.yaml` is a symlink to `config/infisical/agent-config.yaml` so bare `infisical agent` works.

### systemd (user)

Unit file: `~/.config/systemd/user/coc-infisical-agent.service`

```bash
systemctl --user daemon-reload
systemctl --user enable --now coc-infisical-agent.service
journalctl --user -u coc-infisical-agent.service -f
```

## Outputs

| Path | Purpose |
|------|---------|
| `~/.local/state/coc/secrets/access-token` | Short-lived Infisical access token |
| `~/.local/state/coc/secrets/.env` | Rendered secrets (env `dev`) |
| `~/.local/state/coc/secrets/.env.staging` | Staging template |

Point the app at the rendered env (example):

```bash
ln -sfn ~/.local/state/coc/secrets/.env ~/Development/Repos/Chain-of-Command/.env
```

## App integration

- Agent file injection (preferred for local daemons).
- In-process client: `apps/api/src/lib/infisical.ts` using `INFISICAL_CLIENT_ID` / `INFISICAL_CLIENT_SECRET` / `INFISICAL_PROJECT_SLUG`.

If your Infisical **project slug is not** `chain-of-command`, edit both templates in `config/infisical/agent-config.yaml`.
