/**
 * Per-agent Ollama Cloud model map (popular free-tier / starter models).
 *
 * API names use the catalog form (often without a trailing -cloud suffix).
 * Override any slot via env: AGENT_<NAME>_MODEL or the specific keys below.
 */

export type AgentSlot =
  | "yhwh"
  | "michael"
  | "gabriel"
  | "raphael"
  | "metatron"
  | "seraphim"
  | "vision"
  | "coder";

/** Defaults tuned to free-tier Ollama Cloud catalog (Oct 2026). */
export const DEFAULT_CLOUD_MODELS: Record<AgentSlot, string> = {
  // Planning / multilingual agent workflows — NVIDIA MoE
  yhwh: "nemotron-3-super",
  // Orchestration / tool-use / thinking
  michael: "gpt-oss:120b",
  // Messaging / notifications (lighter general)
  gabriel: "gemma4:31b",
  // Task bots + code repair
  raphael: "qwen3-coder:480b",
  // Model gateway reasoning path
  metatron: "kimi-k2.5",
  // Heavy external / research path (when not on Vertex)
  seraphim: "glm-5",
  // Image / document understanding
  vision: "qwen3-vl:235b",
  // Explicit coding slot (alias of raphael default)
  coder: "qwen3-coder:480b",
};

const ENV_KEYS: Partial<Record<AgentSlot, string>> = {
  yhwh: "YHWH_CLOUD_MODEL",
  michael: "MICHAEL_CLOUD_MODEL",
  gabriel: "GABRIEL_CLOUD_MODEL",
  raphael: "RAPHAEL_CLOUD_MODEL",
  metatron: "METATRON_CLOUD_MODEL",
  seraphim: "SERAPHIM_CLOUD_MODEL",
  vision: "VISION_CLOUD_MODEL",
  coder: "CODER_CLOUD_MODEL",
};

/** Resolve cloud model id for an agent slot (env override → default). */
export function cloudModelFor(slot: AgentSlot = "yhwh"): string {
  const envKey = ENV_KEYS[slot];
  if (envKey) {
    const v = process.env[envKey]?.trim();
    if (v) return normalizeCloudModel(v);
  }
  // Global override still works
  const global = process.env.OLLAMA_CLOUD_MODEL?.trim();
  if (global) return normalizeCloudModel(global);
  return DEFAULT_CLOUD_MODELS[slot];
}

/** Accept both `foo:cloud` and `foo` catalog forms. */
export function normalizeCloudModel(name: string): string {
  // Keep :cloud if the catalog expects it; strip only when user passed alias noise
  return name.trim();
}

export function describeAgentModels(): Record<AgentSlot, string> {
  const out = {} as Record<AgentSlot, string>;
  for (const slot of Object.keys(DEFAULT_CLOUD_MODELS) as AgentSlot[]) {
    out[slot] = cloudModelFor(slot);
  }
  return out;
}
