// Daemon entrypoint: boots Michael (orchestrator), listens on HTTP (port 3000) and UDS socket.
import http from "node:http";
import { Michael } from "./michael/orchestrator.js";
import { serve } from "./transport/uds.js";
import { Envelope, Directive, AgentName, log } from "./protocol/types.js";
import { ChatMessage } from "./state/store.js";
import { renderDashboard } from "./ui.js";

async function main() {
  const michael = new Michael();

  // 1. Unix Domain Socket server (backwards-compatible with CLI tools)
  const sock = process.env.MICHAEL_SOCK ?? "/tmp/coc-michael.sock";
  const udsServer = serve(sock, (env: Envelope) => michael.onEnvelope(env));
  udsServer.on("listening", () => log("info", "michael", "uds_socket_ready", { sock }));

  // 2. HTTP Server for AI Studio Web UI (port 3000)
  const port = Number(process.env.PORT ?? 3000);
  const host = "0.0.0.0";

  const httpServer = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url ?? "/", `http://${req.headers.host || "localhost"}`);
    const pathname = parsedUrl.pathname;

    const sendJson = (statusCode: number, data: unknown) => {
      res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(data));
    };

    const readBody = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", () => {
          try {
            resolve(body ? JSON.parse(body) : {});
          } catch (e) {
            reject(e);
          }
        });
        req.on("error", reject);
      });
    };

    // Static Web Dashboard (Telegram GenTeam Style)
    if ((req.method === "GET" || req.method === "HEAD") && (pathname === "/" || pathname === "/index.html")) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      if (req.method === "HEAD") {
        res.end();
      } else {
        res.end(renderDashboard());
      }
      return;
    }

    // Health check
    if ((req.method === "GET" || req.method === "HEAD") && (pathname === "/api/health" || pathname === "/healthz")) {
      sendJson(200, {
        status: "ok",
        orchestrator: "michael",
        uptime: process.uptime(),
        sock,
        agentsCount: michael.getStore().getAgents().length,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Metrics
    if (req.method === "GET" && pathname === "/api/metrics") {
      sendJson(200, michael.getStore().getMetrics());
      return;
    }

    // Chat messages (Telegram feed per channel/DM)
    if (req.method === "GET" && pathname === "/api/messages") {
      const chatId = parsedUrl.searchParams.get("chatId") ?? "general-swarm";
      sendJson(200, michael.getStore().getMessages(chatId));
      return;
    }

    // Send a message or directive into the Telegram chat
    if (req.method === "POST" && pathname === "/api/messages") {
      try {
        const body = await readBody();
        const text = (body.text || "").trim();
        const chatId = body.chatId || "general-swarm";

        if (!text) {
          sendJson(400, { error: "Message text cannot be empty" });
          return;
        }

        // Add user outgoing message
        const userMsg = michael.getStore().addMessage({
          chatId,
          senderId: "user",
          senderName: "You",
          senderAvatarColor: "#2481cc",
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isOutgoing: true,
        });

        // Trigger autonomous orchestration in the background and post agent updates
        (async () => {
          try {
            const directive: Directive = { text, context: { chatId, origin: "telegram_genteam" } };
            const outcome = await michael.handleDirective(directive);

            // 1. YHWH / Ann (Operations Lead) Planning Response
            michael.getStore().addMessage({
              chatId,
              senderId: "yhwh",
              senderName: "YHWH / Ann (Operations Lead)",
              senderAvatarColor: "#818cf8",
              text: `✨ Intent analyzed. Decomposed prayer into ExecutionTree DAG with ${outcome.tree.nodes.length} nodes (Root: \`${outcome.tree.rootId}\`). Handing over to Michael.`,
              canvasAttachment: { type: "dag", id: outcome.directiveId, title: `DAG Execution Tree (${outcome.tree.nodes.length} Nodes)` },
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              isOutgoing: false,
            });

            // 2. Michael Archangel Orchestration Response
            const isSuccess = outcome.results.every((r) => r.state === "succeeded" || r.state === "fallback");
            michael.getStore().addMessage({
              chatId,
              senderId: "michael",
              senderName: "Michael (Archangel Commander)",
              senderAvatarColor: "#0284c7",
              text: `⚡ Kahn topological dependencies resolved. Dispatched tasks to Raphael, Metatron, and Gabriel.\nState: ${isSuccess ? "ALL TASKS COMPLETED" : "PARTIAL RESOLUTION"}`,
              toolUsage: { tool: "KahnTopologicalResolver", status: "completed", durationMs: 120 },
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              isOutgoing: false,
            });

            // 3. Worker Results & Canvas Attachments
            outcome.results.forEach((r) => {
              let senderId: AgentName = "raphael";
              let senderName = "Raphael (Task Bot)";
              let color = "#f59e0b";
              let tool = "CodeGenTool";
              let canvas: ChatMessage["canvasAttachment"] = undefined;

              if (r.taskId.includes("reason")) {
                senderId = "metatron";
                senderName = "Metatron (The Divine Scribe)";
                color = "#a855f7";
                tool = "MetatronOracleRouter";
                canvas = { type: "sheet", id: "cv-sheet-01", title: "Oracle Consensus Matrix" };
              } else if (r.taskId.includes("notify")) {
                senderId = "gabriel";
                senderName = "Gabriel / Ryan (Comms)";
                color = "#10b981";
                tool = "WebhookFanout";
              } else if (r.taskId.includes("scaffold") || r.taskId.includes("migrate")) {
                canvas = { type: "code", id: "cv-code-01", title: "src/auth/jwt_verifier.ts" };
              }

              michael.getStore().addMessage({
                chatId,
                senderId,
                senderName,
                senderAvatarColor: color,
                text: `Delivered subtask [${r.taskId}] — ${r.state.toUpperCase()}`,
                code: r.output ? JSON.stringify(r.output, null, 2) : r.error,
                toolUsage: { tool, status: "completed", durationMs: 280 },
                canvasAttachment: canvas,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                isOutgoing: false,
              });
            });
          } catch (e) {
            michael.getStore().addMessage({
              chatId,
              senderId: "michael",
              senderName: "Michael (Archangel Commander)",
              senderAvatarColor: "#0284c7",
              text: `⚠️ Execution notice: ${String(e)}`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              isOutgoing: false,
            });
          }
        })();

        sendJson(200, { ok: true, userMessage: userMsg });
      } catch (err) {
        sendJson(500, { error: String(err) });
      }
      return;
    }

    // Second Brain endpoints
    if (req.method === "GET" && pathname === "/api/second-brain") {
      sendJson(200, michael.getStore().getSecondBrain());
      return;
    }
    if (req.method === "POST" && pathname === "/api/second-brain") {
      try {
        const body = await readBody();
        const item = michael.getStore().addSecondBrainItem(body);
        sendJson(200, item);
      } catch (e) {
        sendJson(400, { error: String(e) });
      }
      return;
    }

    // Canvases endpoints
    if (req.method === "GET" && pathname === "/api/canvases") {
      sendJson(200, michael.getStore().getCanvases());
      return;
    }
    if (req.method === "POST" && pathname === "/api/canvases") {
      try {
        const body = await readBody();
        const created = michael.getStore().addCanvas({
          type: body.type || "sheet",
          title: body.title || "Untitled Canvas",
          content: typeof body.content === "string" ? body.content : JSON.stringify(body.content || {}),
          lastModifiedBy: body.lastModifiedBy || "User",
        });
        sendJson(200, created);
      } catch (e) {
        sendJson(400, { error: String(e) });
      }
      return;
    }
    if (req.method === "GET" && pathname.startsWith("/api/canvases/")) {
      const id = pathname.replace("/api/canvases/", "");
      const c = michael.getStore().getCanvas(id);
      if (!c) return sendJson(404, { error: "Canvas not found" });
      sendJson(200, c);
      return;
    }
    if (req.method === "PATCH" && pathname.startsWith("/api/canvases/")) {
      const id = pathname.replace("/api/canvases/", "");
      try {
        const body = await readBody();
        const updated = michael.getStore().updateCanvas(id, body.content, body.modifiedBy || "User");
        sendJson(200, updated);
      } catch (e) {
        sendJson(400, { error: String(e) });
      }
      return;
    }

    // Triggers endpoints
    if (req.method === "GET" && pathname === "/api/triggers") {
      sendJson(200, michael.getStore().getTriggers());
      return;
    }
    if (req.method === "POST" && pathname.startsWith("/api/triggers/") && pathname.endsWith("/toggle")) {
      const id = pathname.replace("/api/triggers/", "").replace("/toggle", "");
      const t = michael.getStore().toggleTrigger(id);
      sendJson(200, t ?? { ok: true });
      return;
    }

    // Call recaps endpoints
    if (req.method === "GET" && pathname === "/api/calls") {
      sendJson(200, michael.getStore().getCalls());
      return;
    }
    if (req.method === "POST" && pathname === "/api/calls") {
      try {
        const body = await readBody();
        const call = michael.getStore().addCall({
          vendorName: body.vendorName || "Autonomous Outreach Agent",
          phoneNumber: body.phoneNumber || "+1 (800) 555-0199",
          duration: body.duration || "1m 45s",
          status: "completed",
          summary: body.summary || "Call successfully completed. Verified SLA criteria and updated Second Brain.",
          transcript: body.transcript || [
            { speaker: "Raphael (AI Agent)", text: `Calling regarding: ${body.summary || "infrastructure verification"}.`, timestamp: "00:05" },
            { speaker: "Vendor Rep", text: "Confirmed. Parameters have been synchronized and approved.", timestamp: "00:25" }
          ],
          actionItems: body.actionItems || ["Update Second Brain record", "Notify team via Gabriel webhook"],
        });

        // Broadcast to general swarm
        michael.getStore().addMessage({
          chatId: "general-swarm",
          senderId: "raphael",
          senderName: "Raphael (Task Bot)",
          senderAvatarColor: "#f59e0b",
          text: `📞 Call For Me completed: **${call.vendorName}** (${call.duration}). Summary: ${call.summary}`,
          canvasAttachment: { type: "call", id: call.id, title: `Call Recap: ${call.vendorName}` },
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isOutgoing: false,
        });

        sendJson(200, call);
      } catch (e) {
        sendJson(400, { error: String(e) });
      }
      return;
    }

    // Agents list & Custom Role Deployment
    if (req.method === "GET" && pathname === "/api/agents") {
      sendJson(200, michael.getStore().getAgents());
      return;
    }
    if (req.method === "POST" && pathname === "/api/agents") {
      try {
        const body = await readBody();
        const rawId = (body.id || body.displayName || "custom-bot").toLowerCase().replace(/[^a-z0-9_-]/g, "");
        const id = (rawId as AgentName) || "external";
        const displayName = body.displayName || "Custom Digital Employee";
        const roleTitle = body.roleTitle || "Specialized AI Analyst";
        const agent = michael.getStore().addAgent({
          id,
          display_name: displayName,
          role_title: roleTitle,
          tier: body.tier || "work",
          description: body.description || "Custom digital employee onboarded through GenTeam role deployment.",
          provider: body.provider || "internal",
          model: body.model || "custom-agent-v1",
          target_kinds: body.target_kinds || ["llm.reason", "file.scaffold"],
          status: "active",
          last_heartbeat: new Date().toISOString(),
          notes: body.notes || "Custom digital employee active in GenTeam",
          sort_order: 10 + michael.getStore().getAgents().length,
        });

        // Announce onboarding in general swarm
        michael.getStore().addMessage({
          chatId: "general-swarm",
          senderId: id,
          senderName: displayName,
          senderAvatarColor: body.avatarColor || "#06b6d4",
          text: `👋 Hello team! I have joined the workspace as **${roleTitle}**. Ready to collaborate on tasks, review deliverables on canvases, and manage directives.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isOutgoing: false,
        });

        sendJson(200, agent);
      } catch (e) {
        sendJson(400, { error: String(e) });
      }
      return;
    }

    // Directives list
    if (req.method === "GET" && pathname === "/api/directives") {
      sendJson(200, michael.getStore().getDirectives());
      return;
    }

    // Single directive details
    if (req.method === "GET" && pathname.startsWith("/api/directives/")) {
      const id = pathname.replace("/api/directives/", "");
      const d = michael.getStore().getDirective(id);
      if (!d) return sendJson(404, { error: "Directive not found" });
      sendJson(200, d);
      return;
    }

    // Tasks list (with filters)
    if (req.method === "GET" && pathname === "/api/tasks") {
      let tasks = michael.getStore().getTasks();
      const state = parsedUrl.searchParams.get("state");
      const kind = parsedUrl.searchParams.get("kind");
      const agent = parsedUrl.searchParams.get("agent");
      const directiveId = parsedUrl.searchParams.get("directive_id");

      if (state) tasks = tasks.filter((t) => t.state === state);
      if (kind) tasks = tasks.filter((t) => t.kind === kind);
      if (agent) tasks = tasks.filter((t) => t.routed_to === agent);
      if (directiveId) tasks = tasks.filter((t) => t.directive_id === directiveId);

      sendJson(200, tasks);
      return;
    }

    // Events list
    if (req.method === "GET" && pathname === "/api/events") {
      sendJson(200, michael.getStore().getEvents());
      return;
    }

    // Envelopes list
    if (req.method === "GET" && pathname === "/api/envelopes") {
      sendJson(200, michael.getStore().getEnvelopes());
      return;
    }

    // Direct directive execution endpoint (REST)
    if (req.method === "POST" && pathname === "/api/directive") {
      try {
        const parsed = await readBody();
        const directive: Directive = {
          text: parsed.text || "Default directive",
          context: parsed.context,
        };
        log("info", "michael", "http_directive_received", { text: directive.text });
        const outcome = await michael.handleDirective(directive);
        sendJson(200, outcome);
      } catch (err) {
        log("error", "michael", "http_directive_error", { error: String(err) });
        sendJson(500, { error: String(err) });
      }
      return;
    }

    // 404 Fallback
    sendJson(404, { error: "Not Found", path: pathname });
  });

  httpServer.listen(port, host, () => {
    log("info", "michael", "http_server_ready", { port, host });
  });

  const shutdown = () => {
    log("info", "michael", "shutdown_initiated");
    udsServer.close();
    httpServer.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 2000).unref();
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((e) => {
  console.error(JSON.stringify({ level: "error", event: "fatal", error: String(e) }));
  process.exit(1);
});
