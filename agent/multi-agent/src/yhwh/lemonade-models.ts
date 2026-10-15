/**
 * Lemonade Server models you have installed locally (from `lemonade list`).
 * Used when provider = lemonade.
 */
import type { AgentSlot } from "./models.js";

/** Installed on this machine as of Oct 2026 */
export const INSTALLED_LEMONADE = [
  "DeepSeek-Qwen3-8B-GGUF",
  "Gemma-3-4b-it-GGUF",
  "LMX-Omni-5.5B-Lite",
  "Llama-3.2-1B-Instruct-GGUF",
  "Llama-3.2-3B-Instruct-GGUF",
  "Qwen3.5-4B-MTP-GGUF",
] as const;

export type InstalledLemonadeModel = (typeof INSTALLED_LEMONADE)[number];

/**
 * Per-agent local Lemonade assignment (best fit from what is downloaded).
 * - YHWH / Metatron / Seraphim → strongest reasoning: DeepSeek-Qwen3-8B
 * - Michael → solid instruct: Llama-3.2-3B
 * - Gabriel → light/fast: Llama-3.2-1B
 * - Raphael / Coder → Qwen3.5-4B-MTP (good for tool/code style)
 * - Vision → LMX-Omni-5.5B-Lite (multimodal collection)
 * - default fallback → Gemma-3-4b-it
 */
export const DEFAULT_LEMONADE_MODELS: Record<AgentSlot, string> = {
  yhwh: "DeepSeek-Qwen3-8B-GGUF",
  michael: "Llama-3.2-3B-Instruct-GGUF",
  gabriel: "Llama-3.2-1B-Instruct-GGUF",
  raphael: "Qwen3.5-4B-MTP-GGUF",
  metatron: "DeepSeek-Qwen3-8B-GGUF",
  seraphim: "DeepSeek-Qwen3-8B-GGUF",
  vision: "LMX-Omni-5.5B-Lite",
  coder: "Qwen3.5-4B-MTP-GGUF",
};

const ENV_KEYS: Partial<Record<AgentSlot, string>> = {
  yhwh: "YHWH_LEMONADE_MODEL",
  michael: "MICHAEL_LEMONADE_MODEL",
  gabriel: "GABRIEL_LEMONADE_MODEL",
  raphael: "RAPHAEL_LEMONADE_MODEL",
  metatron: "METATRON_LEMONADE_MODEL",
  seraphim: "SERAPHIM_LEMONADE_MODEL",
  vision: "VISION_LEMONADE_MODEL",
  coder: "CODER_LEMONADE_MODEL",
};

export function lemonadeModelFor(slot: AgentSlot = "yhwh"): string {
  const envKey = ENV_KEYS[slot];
  if (envKey) {
    const v = process.env[envKey]?.trim();
    if (v) return v;
  }
  const global = process.env.LEMONADE_MODEL?.trim();
  if (global) return global;
  return DEFAULT_LEMONADE_MODELS[slot];
}
