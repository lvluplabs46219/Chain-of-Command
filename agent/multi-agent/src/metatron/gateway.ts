// Metatron — Model Gateway Router.
// Routes llm.reason tasks: YHWH (per-agent cloud model) vs Seraphim (Vertex), with fallback.
import * as yhwh from "../yhwh/core.js";
import * as seraphim from "../seraphim/vertex.js";
import { log } from "../protocol/types.js";
import type { AgentSlot } from "../yhwh/models.js";

export interface GatewayDecision {
  tier: "yhwh" | "seraphim" | "seraphim->yhwh";
  reason: string;
  agent: AgentSlot;
}

/** Pick agent slot from prompt heuristics (coding / vision / general). */
export function slotForPrompt(prompt: string): AgentSlot {
  if (/(image|screenshot|pdf|document parse|ocr|vision|vl\b)/i.test(prompt)) return "vision";
  if (/(code|patch|refactor|typescript|python|bug|test suite|implement|pr\b)/i.test(prompt)) {
    return "coder";
  }
  if (/(research|statute|case law|citation|precedent)/i.test(prompt)) return "seraphim";
  return "metatron";
}

/** Heuristic: heavy/consensus work goes external Vertex when enabled. */
export function decide(prompt: string): GatewayDecision {
  const agent = slotForPrompt(prompt);
  if (process.env.SERAPHIM_ENABLED !== "true") {
    return {
      tier: "yhwh",
      reason: "seraphim disabled; using Ollama Cloud / Lemonade via YHWH",
      agent,
    };
  }
  const heavy = /(consensus|deep|review|architect|multi-model|analyze the entire)/i.test(prompt);
  return heavy
    ? { tier: "seraphim", reason: "complexity heuristic matched heavy reasoning", agent }
    : { tier: "yhwh", reason: "within local/cloud capacity", agent };
}

/** Complete a prompt; cascades back to YHWH on Seraphim failure. */
export async function complete(prompt: string): Promise<{ text: string; decision: GatewayDecision }> {
  const decision = decide(prompt);
  if (decision.tier === "yhwh") {
    return {
      text: await yhwh.complete(prompt, undefined, { agent: decision.agent }),
      decision,
    };
  }
  try {
    return { text: await seraphim.complete(prompt), decision };
  } catch (e) {
    log("warn", "metatron", "cascading_to_yhwh", { error: String(e), agent: decision.agent });
    const fallback: GatewayDecision = {
      tier: "seraphim->yhwh",
      reason: "external tier unavailable (timeout/rate limit)",
      agent: decision.agent,
    };
    return {
      text: await yhwh.complete(prompt, undefined, { agent: decision.agent }),
      decision: fallback,
    };
  }
}
