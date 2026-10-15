/**
 * OpenAI-compatible HTTP API so Lemonade Server UI can talk to agent workers.
 *
 * Supports both stream:false JSON and stream:true SSE (Lemonade expects streams).
 */
import http from "node:http";
import { call } from "../transport/uds.js";
import { Directive, envelope } from "../protocol/types.js";

const PORT = Number(process.env.COC_GATEWAY_PORT ?? 8787);
const HOST = process.env.COC_GATEWAY_HOST ?? "127.0.0.1";

const MODELS = [
  { id: "pipeline", description: "Full Chain of Command: YHWH plan → Michael DAG → workers" },
  { id: "yhwh", description: "Talk to YHWH planner (Ollama Cloud)" },
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
  if (!res) return "(empty reply from Michael — is `npm start` running?)";
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

/** OpenAI SSE stream: role chunk, content chunks, finish, [DONE] */
function writeSseStream(res: http.ServerResponse, model: string, content: string) {
  const id = `chatcmpl-coc-${Date.now()}`;
  const created = Math.floor(Date.now() / 1000);

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
  });

  const send = (obj: unknown) => {
    res.write(`data: ${JSON.stringify(obj)}\n\n`);
  };

  // First chunk: role
  send({
    id,
    object: "chat.completion.chunk",
    created,
    model,
    choices: [{ index: 0, delta: { role: "assistant", content: "" }, finish_reason: null }],
  });

  // Content in pieces so UIs that expect progressive tokens work
  const chunkSize = 80;
  for (let i = 0; i < content.length; i += chunkSize) {
    const piece = content.slice(i, i + chunkSize);
    send({
      id,
      object: "chat.completion.chunk",
      created,
      model,
      choices: [{ index: 0, delta: { content: piece }, finish_reason: null }],
    });
  }

  send({
    id,
    object: "chat.completion.chunk",
    created,
    model,
    choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
  });
  res.write("data: [DONE]\n\n");
  res.end();
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

  if (req.method === "GET" && (path === "/" || path === "/health")) {
    json(res, 200, {
      ok: true,
      service: "coc-agent-gateway",
      sock: process.env.MICHAEL_SOCK ?? "/tmp/coc-michael.sock",
    });
    return;
  }

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

  if (req.method === "POST" && (path === "/v1/chat/completions" || path === "/chat/completions")) {
    try {
      const raw = await readBody(req);
      const body = JSON.parse(raw || "{}") as {
        model?: string;
        messages?: ChatMessage[];
        stream?: boolean;
      };
      const modelName = body.model ?? "pipeline";
      const model = modelName.replace(/^coc\./, "");
      const messages = body.messages ?? [];
      const userText = lastUserText(messages);
      if (!userText) {
        json(res, 400, { error: { message: "no user message", type: "invalid_request_error" } });
        return;
      }

      // Long agent runs: if streaming, send a heartbeat comment so clients stay open
      const wantStream = body.stream === true;
      if (wantStream) {
        res.writeHead(200, {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
        });
        // SSE comment keep-alives while agents work
        const heartbeat = setInterval(() => {
          try {
            res.write(": keepalive\n\n");
          } catch {
            clearInterval(heartbeat);
          }
        }, 15_000);

        try {
          // Progress token so UI is not empty while waiting
          const id = `chatcmpl-coc-${Date.now()}`;
          const created = Math.floor(Date.now() / 1000);
          res.write(
            `data: ${JSON.stringify({
              id,
              object: "chat.completion.chunk",
              created,
              model: modelName,
              choices: [
                {
                  index: 0,
                  delta: { role: "assistant", content: "Running agents…\n\n" },
                  finish_reason: null,
                },
              ],
            })}\n\n`,
          );

          const content = await runDirective(userText, model);
          clearInterval(heartbeat);

          const chunkSize = 80;
          for (let i = 0; i < content.length; i += chunkSize) {
            const piece = content.slice(i, i + chunkSize);
            res.write(
              `data: ${JSON.stringify({
                id,
                object: "chat.completion.chunk",
                created,
                model: modelName,
                choices: [{ index: 0, delta: { content: piece }, finish_reason: null }],
              })}\n\n`,
            );
          }
          res.write(
            `data: ${JSON.stringify({
              id,
              object: "chat.completion.chunk",
              created,
              model: modelName,
              choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
            })}\n\n`,
          );
          res.write("data: [DONE]\n\n");
          res.end();
        } catch (e) {
          clearInterval(heartbeat);
          const msg = e instanceof Error ? e.message : String(e);
          try {
            res.write(
              `data: ${JSON.stringify({
                id: `chatcmpl-err-${Date.now()}`,
                object: "chat.completion.chunk",
                created: Math.floor(Date.now() / 1000),
                model: modelName,
                choices: [{ index: 0, delta: { content: `\n\nError: ${msg}` }, finish_reason: "stop" }],
              })}\n\n`,
            );
            res.write("data: [DONE]\n\n");
            res.end();
          } catch {
            res.end();
          }
        }
        return;
      }

      const content = await runDirective(userText, model);
      const id = `chatcmpl-coc-${Date.now()}`;
      json(res, 200, {
        id,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: modelName,
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
    }),
  );
});
