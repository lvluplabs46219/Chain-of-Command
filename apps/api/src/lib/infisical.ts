/**
 * Infisical Secrets Manager Integration for Chain of Command
 * Cloud Domain: https://app.infisical.com
 * 
 * Supports Machine Identity (Universal Auth) and Service Tokens.
 * Automatically injects fetched secrets into process.env if enabled.
 */

export interface InfisicalConfig {
  domain?: string;
  clientId?: string;
  clientSecret?: string;
  projectSlug?: string;
  environment?: string;
  serviceToken?: string;
}

export interface InfisicalSecret {
  secretKey: string;
  secretValue: string;
  version: number;
}

class InfisicalClient {
  private domain: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private cache: Map<string, string> = new Map();
  private lastFetched: number = 0;
  private cacheTtlMs: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.domain = (process.env.INFISICAL_DOMAIN || "https://app.infisical.com").replace(/\/+$/, "");
  }

  /**
   * Authenticate using Machine Identity (Universal Auth)
   */
  private async authenticate(): Promise<string | null> {
    const clientId = process.env.INFISICAL_CLIENT_ID;
    const clientSecret = process.env.INFISICAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return null;
    }

    // Reuse valid token
    if (this.accessToken && Date.now() < this.tokenExpiry - 30000) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.domain}/api/v1/auth/universal-auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          clientSecret,
        }),
      });

      if (!response.ok) {
        console.warn(`[Infisical] Universal Auth login failed: HTTP ${response.status}`);
        return null;
      }

      const data = await response.json() as { accessToken: string; expiresIn: number };
      this.accessToken = data.accessToken;
      this.tokenExpiry = Date.now() + (data.expiresIn * 1000);
      return this.accessToken;
    } catch (err) {
      console.warn("[Infisical] Universal Auth connection error:", err);
      return null;
    }
  }

  /**
   * Fetch all secrets for the configured project and environment
   */
  public async fetchSecrets(options: {
    projectSlug?: string;
    environment?: string;
    secretPath?: string;
  } = {}): Promise<Record<string, string>> {
    const now = Date.now();
    if (this.cache.size > 0 && now - this.lastFetched < this.cacheTtlMs) {
      return Object.fromEntries(this.cache);
    }

    const env = options.environment || process.env.INFISICAL_ENVIRONMENT || "dev";
    const projectSlug = options.projectSlug || process.env.INFISICAL_PROJECT_SLUG || "chain-of-command";
    const path = options.secretPath || "/";

    // 1. Try Service Token
    const serviceToken = process.env.INFISICAL_SERVICE_TOKEN;
    if (serviceToken) {
      try {
        const res = await fetch(`${this.domain}/api/v3/secrets/raw?environment=${encodeURIComponent(env)}&secretPath=${encodeURIComponent(path)}`, {
          headers: {
            Authorization: `Bearer ${serviceToken}`,
          },
        });
        if (res.ok) {
          const body = await res.json() as { secrets: Array<{ secretKey: string; secretValue: string }> };
          this.cache.clear();
          for (const s of body.secrets) {
            this.cache.set(s.secretKey, s.secretValue);
          }
          this.lastFetched = now;
          return Object.fromEntries(this.cache);
        }
      } catch (e) {
        console.warn("[Infisical] Failed to fetch via Service Token:", e);
      }
    }

    // 2. Try Universal Auth (Machine Identity)
    const token = await this.authenticate();
    if (token) {
      try {
        const res = await fetch(
          `${this.domain}/api/v3/secrets/raw?workspaceSlug=${encodeURIComponent(projectSlug)}&environment=${encodeURIComponent(env)}&secretPath=${encodeURIComponent(path)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.ok) {
          const body = await res.json() as { secrets: Array<{ secretKey: string; secretValue: string }> };
          this.cache.clear();
          for (const s of body.secrets) {
            this.cache.set(s.secretKey, s.secretValue);
          }
          this.lastFetched = now;
          return Object.fromEntries(this.cache);
        } else {
          console.warn(`[Infisical] Failed to fetch secrets: HTTP ${res.status}`);
        }
      } catch (e) {
        console.warn("[Infisical] Failed to fetch via Machine Identity:", e);
      }
    }

    return Object.fromEntries(this.cache);
  }

  /**
   * Load secrets from Infisical into process.env without overriding existing variables
   */
  public async loadIntoEnv(override = false): Promise<number> {
    const secrets = await this.fetchSecrets();
    let loaded = 0;
    for (const [key, value] of Object.entries(secrets)) {
      if (override || !process.env[key]) {
        process.env[key] = value;
        loaded++;
      }
    }
    return loaded;
  }

  /**
   * Retrieve a single secret with fallback to process.env
   */
  public async getSecret(key: string, fallback?: string): Promise<string | undefined> {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    return process.env[key] ?? fallback;
  }
}

export const infisical = new InfisicalClient();
