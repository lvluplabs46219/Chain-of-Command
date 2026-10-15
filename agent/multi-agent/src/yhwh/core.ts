// YHWH — Core Reasoning Engine
// Default: Ollama Cloud free-tier models (per-agent).
// Optional fallbacks: local Ollama, then Lemonade (only if LLM_PROVIDER includes them).
//
// LLM_PROVIDER=
//   ollama-cloud  (default) — agents on cloud free models
//   ollama        — local Ollama only
//   lemonade      — Lemonade Server only (NOT the agent assignment path)
//   auto          — cloud → local ollama → lemonade
import { Directive, ExecutionTree, log } from "../protocol/types.js";
import { AgentSlot, cloudModelFor } from "./models.js";

type Provider = "ollama-cloud" | "ollama" | "lemonade";

export type CompleteOpts = {
  json?: boolean;
  timeoutMs?: number;
  /** Agent slot → selects that agent's Ollama Cloud model */
  agent?: AgentSlot;
};

function lemonadeBase(): string {
  return (process.env.LEMONADE_URL ?? "http://127.0.0.1:13305").replace(/\/$/, "");
}
function ollamaLocalBase(): string {
  return (process.env.OLLAMA_URL ?? "http://127.0.0.1:11434").replace(/\/$/, "");
}
function ollamaCloudBase(): string {
  return (process.env.OLLAMA_CLOUD_URL ?? "https://ollama.com").replace(/\/$/, "");
}

function localOllamaModel(): string {
  return process.env.OLLAMA_MODEL ?? "qwen2.5:7b";
}

function lemonadeModel(): string {
  return process.env.LEMONADE_MODEL ?? "DeepSeek-Qwen3-8B-GGUF";
}

/** Default is Ollama Cloud — agents are NOT Lemonade agents. */
function providerOrder(): Provider[] {
  const forced = (process.env.LLM_PROVIDER ?? "ollama-cloud").toLowerCase().trim();
  if (forced === "lemonade") return ["lemonade"];
  if (forced === "ollama" || forced === "ollama-local") return ["ollama"];
  if (forced === "auto") return ["ollama-cloud", "ollama", "lemonade"];
  // ollama-cloud (default) and anything else → cloud only
  return ["ollama-cloud"];
}

function buildMessages(prompt: string, system?: string): { role: string; content: string }[] {
  const messages: { role: string; content: string }[] = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });
  return messages;
}

async function completeOllamaCloud(
  prompt: string,
  system?: string,
  opts: CompleteOpts = {},
): Promise<{ text: string; model: string }> {
  const key = process.env.OLLAMA_API_KEY;
  if (!key) {
    throw new Error(
      "OLLAMA_API_KEY not set. Agents use Ollama Cloud free models — create a key at https://ollama.com/settings/keys",
    );
  }

  const base = ollamaCloudBase();
  const model = cloudModelFor(opts.agent ?? "yhwh");
  const messages = buildMessages(prompt, system);

  const attempts: { url: string; body: Record<string, unknown>; parse: (j: unknown) => string | null }[] = [
    {
      url: `${base}/v1/chat/completions`,
      body: {
        model,
        messages,
        stream: false,
        temperature: 0.2,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      },
      parse: (j) => {
        const x = j as { choices?: { message?: { content?: string } }[] };
        return x.choices?.[0]?.message?.content ?? null;
      },
    },
    {
      url: `${base}/api/chat`,
      body: {
        model,
        messages,
        stream: false,
        ...(opts.json ? { format: "json" } : {}),
      },
      parse: (j) => {
        const x = j as { message?: { content?: string } };
        return x.message?.content ?? null;
      },
    },
  ];

  let lastErr: Error | null = null;
  for (const a of attempts) {
    try {
      const res = await fetch(a.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(a.body),
        signal: AbortSignal.timeout(opts.timeoutMs ?? 180_000),
      });
      if (!res.ok) {
        lastErr = new Error(
          `Ollama Cloud ${res.status} model=${model}: ${(await res.text().catch(() => "")).slice(0, 300)}`,
        );
        continue;
      }
      const json = await res.json();
      const content = a.parse(json);
      if (typeof content === "string" && content.length) return { text: content, model };
      lastErr = new Error(`Ollama Cloud empty content model=${model}`);
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastErr ?? new Error("Ollama Cloud unreachable");
}

async function completeOllamaLocal(
  prompt: string,
  system?: string,
  opts: CompleteOpts = {},
): Promise<string> {
  const res = await fetch(`${ollamaLocalBase()}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: localOllamaModel(),
      prompt,
      system,
      stream: false,
      ...(opts.json ? { format: "json" } : {}),
    }),
    signal: AbortSignal.timeout(opts.timeoutMs ?? 120_000),
  });
  if (!res.ok) {
    throw new Error(`Ollama local ${res.status}: ${(await res.text().catch(() => "")).slice(0, 300)}`);
  }
  const json = (await res.json()) as { response: string };
  return json.response;
}

/** Optional Lemonade path — only when LLM_PROVIDER=lemonade or auto. Not used for agent model assignment. */
async function completeLemonade(
  prompt: string,
  system?: string,
  opts: CompleteOpts = {},
): Promise<string> {
  const base = lemonadeBase();
  const model = lemonadeModel();
  const urls = [`${base}/api/v1/chat/completions`, `${base}/v1/chat/completions`];
  const messages = buildMessages(prompt, system);
  let lastErr: Error | null = null;

  for (const url of urls) {
    try {
      const body: Record<string, unknown> = {
        model,
        messages,
        stream: false,
        temperature: 0.2,
      };
      if (opts.json) body.response_format = { type: "json_object" };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer lemonade",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(opts.timeoutMs ?? 120_000),
      });
      if (!res.ok) {
        lastErr = new Error(`Lemonade ${res.status}: ${(await res.text().catch(() => "")).slice(0, 300)}`);
        continue;
      }
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const content = json.choices?.[0]?.message?.content;
      if (typeof content === "string" && content.length) return content;
      lastErr = new Error("Lemonade empty content");
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastErr ?? new Error("Lemonade unreachable");
}

export async function complete(
  prompt: string,
  system?: string,
  opts: CompleteOpts = {},
): Promise<string> {
  const order = providerOrder();
  const agent = opts.agent ?? "yhwh";
  let lastErr: Error | null = null;

  for (const p of order) {
    try {
      if (p === "ollama-cloud") {
        const { text, model } = await completeOllamaCloud(prompt, system, opts);
        log("info", "yhwh", "complete_ok", { provider: "ollama-cloud", agent, model });
        return text;
      }
      if (p === "ollama") {
        const out = await completeOllamaLocal(prompt, system, opts);
        log("info", "yhwh", "complete_ok", { provider: "ollama-local", agent, model: localOllamaModel() });
        return out;
      }
      const out = await completeLemonade(prompt, system, opts);
      log("info", "yhwh", "complete_ok", { provider: "lemonade", agent, model: lemonadeModel() });
      return out;
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      log("warn", "yhwh", "provider_failed", { provider: p, agent, error: String(e) });
    }
  }

  throw new Error(
    `YHWH: no LLM for agent=${agent} (tried ${order.join(" → ")}). ` +
      `Set OLLAMA_API_KEY for cloud free models. Last error: ${lastErr?.message ?? "unknown"}`,
  );
}

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
      { json: true, agent: "yhwh" },
    );
    const tree = JSON.parse(extractJson(raw)) as ExecutionTree;
    if (!tree.rootId || !Array.isArray(tree.nodes) || tree.nodes.length === 0) throw new Error("missing fields");
    log("info", "yhwh", "plan_generated", { nodes: tree.nodes.length, rootId: tree.rootId });
    return tree;
  } catch (e) {
    log("warn", "yhwh", "plan_parse_failed_fallback_single_node", { error: String(e) });
    return {
      rootId: "t1",
      nodes: [{ id: "t1", kind: "llm.reason", dependsOn: [], payload: { prompt: directive.text } }],
    };
  }
}
