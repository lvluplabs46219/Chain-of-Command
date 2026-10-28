// Metatron — Model Gateway Router.
// Routes llm.reason tasks: local (YHWH) vs external (Seraphim), with fallback.
import * as yhwh from "../yhwh/core.js";
import * as seraphim from "../seraphim/vertex.js";
import { log } from "../protocol/types.js";

export interface GatewayDecision {
  tier: "yhwh" | "seraphim" | "seraphim->yhwh";
  reason: string;
}

/** Heuristic: heavy/consensus work goes external; everything else stays local. */
export function decide(prompt: string): GatewayDecision {
  const heavy = /(consensus|deep|review|architect|multi-model|analyze the entire)/i.test(prompt);
  return heavy
    ? { tier: "seraphim", reason: "complexity heuristic matched heavy reasoning" }
    : { tier: "yhwh", reason: "within local capacity" };
}

/** Complete a prompt; cascades back to YHWH on Seraphim failure. */
export async function complete(prompt: string): Promise<{ text: string; decision: GatewayDecision }> {
  const decision = decide(prompt);
  if (decision.tier === "yhwh") {
    return { text: await yhwh.complete(prompt), decision };
  }
  try {
    return { text: await seraphim.complete(prompt), decision };
  } catch (e) {
    log("warn", "metatron", "cascading_to_yhwh", { error: String(e) });
    const fallback: GatewayDecision = {
      tier: "seraphim->yhwh",
      reason: "external tier unavailable (timeout/rate limit)",
    };
    return { text: await yhwh.complete(prompt), decision: fallback };
  }
}
