// Seraphim — External LLM Pool (OpenAI-compatible Hermes API).
// Endpoints via HERMES_BASE_URL (OpenRouter / Nous / local proxy), no Vertex / Gemini credentials.
import { log } from "../protocol/types.js";

const enabled = (): boolean => process.env.SERAPHIM_ENABLED === "true";
const hermesBaseUrl = (): string =>
  (process.env.HERMES_BASE_URL ?? process.env.OLLAMA_URL ?? "http://127.0.0.1:11434").replace(/\/+$/, "");
const hermesApiKey = (): string | undefined => process.env.HERMES_API_KEY;
const modelId = (): string => process.env.SERAPHIM_MODEL ?? "hermes3:70b";

class SeraphimError extends Error {
  constructor(message: string, public retriable: boolean) { super(message); }
}

/** Deep-reasoning completion via OpenAI-compatible Hermes endpoint. Timeout + retry aware. */
export async function complete(prompt: string, timeoutMs?: number): Promise<string> {
  if (!enabled()) throw new SeraphimError("seraphim disabled", false);
  const timeout = timeoutMs ?? Number(process.env.SERAPHIM_TIMEOUT_MS ?? 30_000);
  const retries = Number(process.env.SERAPHIM_RETRIES ?? 1);
  let lastErr: unknown;

  const base = hermesBaseUrl();
  const isOllama = base.includes(":11434");
  const endpoint = isOllama ? `${base}/api/generate` : `${base}/chat/completions`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const apiKey = hermesApiKey();
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

      const body = isOllama
        ? JSON.stringify({ model: modelId(), prompt, stream: false })
        : JSON.stringify({
            model: modelId(),
            messages: [
              { role: "system", content: "You are Seraphim, an advanced deep-reasoning oracle in the Empyrean multi-agent swarm." },
              { role: "user", content: prompt },
            ],
            temperature: 0.3,
          });

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body,
        signal: ctrl.signal,
      }).finally(() => clearTimeout(timer));

      if (res.status === 429 || res.status >= 500) throw new SeraphimError(`http ${res.status}`, true);
      if (!res.ok) throw new SeraphimError(`http ${res.status}`, false);

      const json = (await res.json()) as any;
      if (isOllama && json.response) return json.response;
      if (json.choices?.[0]?.message?.content) return json.choices[0].message.content;
      throw new SeraphimError("empty response from hermes endpoint", false);
    } catch (e) {
      lastErr = e;
      const retriable = e instanceof SeraphimError ? e.retriable : true;
      if (!retriable) break;
    }
  }

  log("warn", "seraphim", "hermes_external_failed", { error: String(lastErr) });
  throw lastErr ?? new SeraphimError("unknown failure", false);
}
