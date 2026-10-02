// YHWH — Core Reasoning Engine (local inference via Ollama / Lemonade).
// Parses ambiguous intent and outputs structured execution trees.
import { Directive, ExecutionTree, log } from "../protocol/types.js";

const ollamaUrl = (): string => process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
const model = (): string => process.env.YHWH_MODEL ?? "qwen2.5:7b";

/** Raw completion against the local provider. */
export async function complete(
  prompt: string,
  system?: string,
  opts: { json?: boolean; timeoutMs?: number } = {},
): Promise<string> {
  const res = await fetch(`${ollamaUrl()}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: model(), prompt, system, stream: false, ...(opts.json ? { format: "json" } : {}) }),
    signal: AbortSignal.timeout(opts.timeoutMs ?? 120_000),
  });
  if (!res.ok) throw new Error(`YHWH provider error: ${res.status} ${(await res.text().catch(() => "")).slice(0, 300)}`);
  const json = (await res.json()) as { response: string };
  return json.response;
}

/** Extract the first balanced JSON object from raw model output. */
function extractJson(raw: string): string {
  const s = raw.replace(/```(?:json)?/g, "");
  const start = s.indexOf("{");
  if (start < 0) throw new Error("no JSON object found");
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}") {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return s.slice(start);
}

/** High-level directive -> structured execution tree (DAG). */
export async function plan(directive: Directive): Promise<ExecutionTree> {
  const system = [
    "You are YHWH, a planning kernel that decomposes directives into executable task DAGs.",
    "Output ONLY JSON matching:",
    '{"rootId":"<id>","nodes":[{"id":"<id>","kind":"<TaskKind>","dependsOn":["<id>"],"payload":{}}]}',
    "Valid TaskKind values and their payloads:",
    '- "llm.reason": payload {"prompt": "<text>"} - reasoning, drafting code, analysis, summarization.',
    '- "file.scaffold": payload {"path": "<relative path>", "content": "<full file content>"} - write a file.',
    '- "shell.exec": payload {"cmd": "<shell command>", "cwd": "<relative working dir>"} - run tests, builds, git, docker, npm.',
    '- "db.migrate": payload {"cmd": "<migration command>", "cwd": "<relative dir>"} - database migrations.',
    '- "workspace.maintain": payload {"cmd": "<lint/format/build command>", "cwd": "<relative dir>"} - project maintenance.',
    '- "notify": payload {"message": "<text>"} - report outcomes to the user.',
    "Rules:",
    "1. ALWAYS decompose non-trivial directives into MULTIPLE nodes (2-7). Never answer with a single node unless the directive is a trivial question.",
    "2. Nodes must form a DAG; use dependsOn to order them.",
    "3. For coding work: llm.reason to draft the code, then file.scaffold to write it, then shell.exec to build or test it, then llm.reason over the results if analysis is needed, then notify.",
    "4. For devops work: use shell.exec with concrete commands (npm test, git status, docker compose ps) and chain dependent steps with dependsOn.",
    "5. Payloads must be concrete and complete - never leave placeholders in final output.",
    `6. All paths and cwd values are RELATIVE to the workspace root (${process.env.RAPHAEL_WORKSPACE ?? process.cwd()}). Use "." for the root. NEVER use absolute paths or invented directories such as /path/to/repo or workspace/.`,
    "7. A node cannot see other nodes' output unless it lists them in dependsOn; llm.reason nodes automatically receive the output of their dependencies.",
  ].join(" ");
  try {
    const raw = await complete(
      `Directive: ${directive.text}\nContext: ${JSON.stringify(directive.context ?? {})}`,
      system,
      { json: true },
    );
    const tree = JSON.parse(extractJson(raw)) as ExecutionTree;
    if (!tree.rootId || !Array.isArray(tree.nodes) || tree.nodes.length === 0) throw new Error("missing fields");
    log("info", "yhwh", "plan_generated", { nodes: tree.nodes.length, rootId: tree.rootId });
    return tree;
  } catch (e) {
    // Graceful degradation: single local-reasoning task.
    log("warn", "yhwh", "plan_parse_failed_fallback_single_node", { error: String(e) });
    return {
      rootId: "t1",
      nodes: [{ id: "t1", kind: "llm.reason", dependsOn: [], payload: { prompt: directive.text } }],
    };
  }
}
