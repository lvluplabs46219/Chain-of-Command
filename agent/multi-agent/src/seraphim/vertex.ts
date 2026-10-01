// Seraphim — External LLM Pool (Google Vertex AI).
// Credentials via GOOGLE_APPLICATION_CREDENTIALS (env) — never hardcoded.
import { log } from "../protocol/types.js";

const enabled = (): boolean => process.env.SERAPHIM_ENABLED === "true";
const project = (): string => process.env.SERAPHIM_PROJECT ?? "";
const location = (): string => process.env.SERAPHIM_LOCATION ?? "us-central1";
const modelId = (): string => process.env.SERAPHIM_MODEL ?? "gemini-2.0-flash";

class SeraphimError extends Error {
  constructor(message: string, public retriable: boolean) { super(message); }
}

/** Service-account JWT -> OAuth2 access token (no gcloud dependency). */
async function accessToken(): Promise<string> {
  const { readFileSync } = await import("node:fs");
  const { createSign } = await import("node:crypto");
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyPath) throw new SeraphimError("GOOGLE_APPLICATION_CREDENTIALS not set", false);
  const key = JSON.parse(readFileSync(keyPath, "utf8"));

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claims = Buffer.from(JSON.stringify({
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })).toString("base64url");

  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = signer.sign(key.private_key).toString("base64url");
  const jwt = `${header}.${claims}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new SeraphimError(`token exchange failed: ${res.status}`, true);
  return ((await res.json()) as { access_token: string }).access_token;
}

/** Deep-reasoning completion via the external pool. Timeout + retry aware. */
export async function complete(prompt: string, timeoutMs?: number): Promise<string> {
  if (!enabled()) throw new SeraphimError("seraphim disabled", false);
  const timeout = timeoutMs ?? Number(process.env.SERAPHIM_TIMEOUT_MS ?? 30_000);
  const retries = Number(process.env.SERAPHIM_RETRIES ?? 1);
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const token = await accessToken();
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeout);
      try {
        const res = await fetch(
          `https://${location()}-aiplatform.googleapis.com/v1/projects/${project()}` +
          `/locations/${location()}/publishers/google/models/${modelId()}:generateContent`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
            signal: ctrl.signal,
          },
        );
        if (res.status === 429 || res.status >= 500) throw new SeraphimError(`http ${res.status}`, true);
        if (!res.ok) throw new SeraphimError(`http ${res.status}`, false);
        const json = (await res.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        return json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      } finally {
        clearTimeout(timer);
      }
    } catch (e) {
      lastErr = e;
      const retriable = e instanceof SeraphimError ? e.retriable : true;
      if (!retriable) break;
    }
  }

  log("warn", "seraphim", "external_failed", { error: String(lastErr) });
  throw lastErr ?? new SeraphimError("unknown failure", false);
}
