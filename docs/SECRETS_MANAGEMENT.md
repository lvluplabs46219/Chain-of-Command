# Infisical Secrets Management Guide

**Chain of Command** uses [Infisical Cloud (US)](https://app.infisical.com/) for centralized, end-to-end encrypted secret storage and distribution across local development, CI/CD, and production environments.

---

## 1. Quick Overview

- **Cloud Platform URL**: [https://app.infisical.com](https://app.infisical.com)
- **Project Configuration**: `/infisical.json`
- **GitHub Actions Action**: `Infisical/secrets-action@v1.0.7`
- **Application Helper**: `apps/api/src/lib/infisical.ts`

---

## 2. Setting Up in Infisical (Web UI)

1. Log into your dashboard at [https://app.infisical.com](https://app.infisical.com).
2. Create or navigate to your project: `chain-of-command`.
3. In **Project Settings > Project Details**, find your **Project Slug** (e.g. `chain-of-command`).
4. In **Access Control > Machine Identities**, create a Machine Identity for CI/CD:
   - Name: `github-actions-runner`
   - Role: `Viewer` (or `Developer`)
   - Add **Universal Auth** credentials:
     - Note the generated **Client ID** (`INFISICAL_CLIENT_ID`)
     - Note the generated **Client Secret** (`INFISICAL_CLIENT_SECRET`)
5. Populate your secrets under the **dev**, **staging**, and **prod** environments:
   - `GEMINI_API_KEY`
   - `FIREBASE_API_KEY`
   - `DATABASE_URL` / `SQL_PASSWORD`
   - `COURTLISTENER_API_KEY`
   - `COURTLISTENER_WEBHOOK_SECRET`
   - `ANTHROPIC_API_KEY`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `ALLOWED_ORIGINS`

---

## 3. GitHub Actions Integration

The main deployment workflow (`.github/workflows/main.yml`) automatically fetches secrets during CI runs:

```yaml
- name: Fetch Secrets from Infisical (Universal Auth)
  if: ${{ secrets.INFISICAL_CLIENT_ID != '' && secrets.INFISICAL_CLIENT_SECRET != '' }}
  uses: Infisical/secrets-action@v1.0.7
  with:
    client-id: ${{ secrets.INFISICAL_CLIENT_ID }}
    client-secret: ${{ secrets.INFISICAL_CLIENT_SECRET }}
    project-slug: ${{ secrets.INFISICAL_PROJECT_SLUG || 'chain-of-command' }}
    env-slug: "prod"
    domain: "https://app.infisical.com"
```

### GitHub Repository Secrets Needed:
To enable automated secret injection, add these repository secrets in GitHub (`Settings > Secrets and variables > Actions`):
- `INFISICAL_CLIENT_ID`: Machine Identity Client ID
- `INFISICAL_CLIENT_SECRET`: Machine Identity Client Secret
- `INFISICAL_PROJECT_SLUG`: Project slug (e.g., `chain-of-command`)
- `INFISICAL_ENV_SLUG`: Environment name (`prod` or `dev`)

---

## 4. Local Development with Infisical CLI

### Installation:
```bash
# MacOS (Homebrew)
brew install infisical/get-cli/infisical

# Debian / Ubuntu / Linux
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install -y infisical
```

### Authentication & Project Linking:
```bash
# Log in to Infisical Cloud
infisical login --domain https://app.infisical.com

# Link repository to your Infisical project
infisical link --domain https://app.infisical.com
```

### Run with Injected Secrets:
```bash
# Runs dev server with real-time decrypted environment variables
infisical run -- npm run dev

# Export into a local .env.local file
infisical export --domain https://app.infisical.com --env=dev > .env.local
```

---

## 5. Runtime Secret Ingestion (Node.js)

For background workers or server processes running outside the Infisical CLI, `apps/api/src/lib/infisical.ts` provides on-demand secret retrieval:

```typescript
import { infisical } from "./lib/infisical";

// Automatically inject secrets into process.env at server boot
await infisical.loadIntoEnv();

// Or retrieve single secrets dynamically
const apiKey = await infisical.getSecret("GEMINI_API_KEY");
```
