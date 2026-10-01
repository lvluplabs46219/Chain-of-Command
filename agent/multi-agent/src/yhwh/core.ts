// YHWH — Core Reasoning Engine (local inference via Ollama / Lemonade).
// Parses ambiguous intent and outputs structured execution trees.
import { Directive, ExecutionTree, log } from "../protocol/types.js";

const ollamaUrl = (): string => process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
const model = (): string => process.env.YHWH_MODEL ?? "qwen2.5:7b";

/** Raw completion against the local provider. */
export async function complete(prompt: string, system?: string): Promise<string> {
  const res = await fetch(`${ollamaUrl()}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: model(), prompt, system, stream: false }),
  });
  if (!res.ok) throw new Error(`YHWH provider error: ${res.status}`);
  const json = (await res.json()) as { response: string };
  return json.response;
}

/** High-level directive -> structured execution tree (DAG). */
export async function plan(directive: Directive): Promise<ExecutionTree> {
  const system = [
    "You are YHWH, a planning kernel.",
    'Given a user directive, output ONLY JSON matching:',
    '{"rootId":"<id>","nodes":[{"id":"<id>","kind":"<TaskKind>","dependsOn":["<id>"],"payload":{}}]}',
    "Valid TaskKind values: llm.reason, file.scaffold, db.migrate, workspace.maintain, notify, deliver_payload.",
    "Nodes must form a DAG. dependsOn may be empty.",
  ].join(" ");
  try {
    const raw = await complete(
      `Directive: ${directive.text}\nContext: ${JSON.stringify(directive.context ?? {})}`,
      system,
    );
    const tree = JSON.parse(raw.trim().replace(/^```(json)?|```$/g, "")) as ExecutionTree;
    if (!tree.rootId || !Array.isArray(tree.nodes)) throw new Error("missing fields");
    return tree;
  } catch {
    // Graceful degradation: single local-reasoning task.
    log("warn", "yhwh", "plan_parse_failed_fallback_single_node");
    return {
      rootId: "t1",
      nodes: [{ id: "t1", kind: "llm.reason", dependsOn: [], payload: { directive } }],
    };
  }
}
