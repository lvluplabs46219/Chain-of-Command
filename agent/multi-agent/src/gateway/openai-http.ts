/**
 * OpenAI-compatible HTTP API so Lemonade Server UI can talk to agent workers.
 *
 * Agents still run on Ollama Cloud. This is only the chat front-door.
 *
 *   GET  /v1/models
 *   POST /v1/chat/completions
 *
 * Register with Lemonade:
 *   lemonade cloud install coc --base-url http://127.0.0.1:8787/v1 --api-key coc
 *
 * Then pick models like coc.pipeline or coc.yhwh in the Lemonade UI.
 */
import http from "node:http";
import { call } from "../transport/uds.js";
import { Directive, envelope } from "../protocol/types.js";

const PORT = Number(process.env.COC_GATEWAY_PORT ?? 8787);
const HOST = process.env.COC_GATEWAY_HOST ?? "127.0.0.1";

/** Models shown in Lemonade UI (namespaced as coc.* after cloud install). */
const MODELS = [
  { id: "pipeline", description: "Full Chain of Command: YHWH plan → Michael DAG → workers" },
  { id: "yhwh", description: "Talk to YHWH planner (Ollama Cloud nemotron-3-super)" },
  { id: "michael", description: "Orchestrator path via full pipeline" },
  { id: "raphael", description: "Task / code-repair worker path" },
  { id: "gabriel", description: "Messenger / notify path" },
  { id: "metatron", description: "Model gateway reasoning path" },
] as const;

type ChatMessage = { role: string; content: string | null | Array<{ type?: string; text?: string }> };

function textFromContent(content: ChatMessage["content"]): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((p) => (typeof p === "string" ? p : p.text ?? "")).join("");
  }
  return "";
}

function lastUserText(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === "user") return textFromContent(messages[i].content).trim();
  }
  return messages.map((m) => `${m.role}: ${textFromContent(m.content)}`).join("\n").trim();
}

function formatResults(payload: unknown): string {
  if (payload == null) return "(no response from agents)";
  if (typeof payload === "string") return payload;
  if (typeof payload === "object" && payload !== null && "error" in payload) {
    return `Error: ${String((payload as { error: unknown }).error)}`;
  }
  // Michael returns TaskResult[]
  if (Array.isArray(payload)) {
    const lines: string[] = ["## Agent run results", ""];
    for (const r of payload as { taskId?: string; state?: string; output?: unknown; error?: string }[]) {
      lines.push(`### ${r.taskId ?? "task"} — **${r.state ?? "?"}**`);
      if (r.error) lines.push(`Error: ${r.error}`);
      if (r.output !== undefined) {
        const o =
          typeof r.output === "string"
            ? r.output
            : typeof (r.output as { text?: string })?.text === "string"
              ? (r.output as { text: string }).text
              : JSON.stringify(r.output, null, 2);
        lines.push(o);
      }
      lines.push("");
    }
    return lines.join("\n").trim() || JSON.stringify(payload, null, 2);
  }
  return JSON.stringify(payload, null, 2);
}

async function runDirective(text: string, modelHint: string): Promise<string> {
  const directive: Directive = {
    text,
    context: { source: "lemonade-ui", model: modelHint },
  };
  const res = await call(envelope("directive", "gateway", "michael", directive), 300_000);
  if (!res) return "(empty reply from Michael)";
  return formatResults(res.payload);
}

function json(res: http.ServerResponse, status: number, body: unknown) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(data);
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${HOST}:${PORT}`);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    });
    res.end();
    return;
  }

  // Health
  if (req.method === "GET" && (path === "/" || path === "/health")) {
    json(res, 200, { ok: true, service: "coc-agent-gateway", sock: process.env.MICHAEL_SOCK ?? "/tmp/coc-michael.sock" });
    return;
  }

  // OpenAI: list models
  if (req.method === "GET" && (path === "/v1/models" || path === "/models")) {
    json(res, 200, {
      object: "list",
      data: MODELS.map((m) => ({
        id: m.id,
        object: "model",
        created: 0,
        owned_by: "chain-of-command",
        description: m.description,
      })),
    });
    return;
  }

  // OpenAI: chat completions
  if (req.method === "POST" && (path === "/v1/chat/completions" || path === "/chat/completions")) {
    try {
      const raw = await readBody(req);
      const body = JSON.parse(raw || "{}") as {
        model?: string;
        messages?: ChatMessage[];
        stream?: boolean;
      };
      const model = (body.model ?? "pipeline").replace(/^coc\./, "");
      const messages = body.messages ?? [];
      const userText = lastUserText(messages);
      if (!userText) {
        json(res, 400, { error: { message: "no user message", type: "invalid_request_error" } });
        return;
      }

      // Streaming not implemented — return full reply (Lemonade accepts non-stream)
      const content = await runDirective(userText, model);
      const id = `chatcmpl-coc-${Date.now()}`;
      json(res, 200, {
        id,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: body.model ?? model,
        choices: [
          {
            index: 0,
            message: { role: "assistant", content },
            finish_reason: "stop",
          },
        ],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      });
    } catch (e) {
      json(res, 500, {
        error: {
          message: e instanceof Error ? e.message : String(e),
          type: "server_error",
        },
      });
    }
    return;
  }

  json(res, 404, { error: { message: `not found: ${path}`, type: "invalid_request_error" } });
});

server.listen(PORT, HOST, () => {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      agent: "gateway",
      event: "openai_gateway_ready",
      url: `http://${HOST}:${PORT}/v1`,
      lemonade: `lemonade cloud install coc --base-url http://${HOST}:${PORT}/v1 --api-key coc`,
    }),
  );
});
