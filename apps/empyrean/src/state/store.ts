// State persistence & in-memory relational store.
// Models: Agents, Directives, Tasks, Events, Envelopes, Telegram Chats, Second Brain, Canvases, Triggers, and Calls.
import { log, AgentName, TaskKind, TaskState, ExecutionTree, Envelope } from "../protocol/types.js";

export interface AgentRecord {
  id: AgentName;
  display_name: string;
  role_title: string;
  tier: "reason" | "control" | "work" | "comms" | "gateway" | "external";
  description: string;
  provider: "ollama" | "lemonade" | "vertex" | "internal" | "external" | "none";
  model: string;
  target_kinds: TaskKind[];
  status: "idle" | "active" | "degraded" | "down";
  last_heartbeat: string;
  notes: string;
  sort_order: number;
}

export interface DirectiveRecord {
  id: string;
  text: string;
  context?: Record<string, unknown>;
  planned_by: "yhwh" | "fallback";
  tree: ExecutionTree;
  status: "pending" | "running" | "succeeded" | "failed";
  received_at: string;
  settled_at?: string;
}

export interface TaskRecord {
  id: string;
  directive_id: string;
  kind: TaskKind;
  depends_on: string[];
  routed_to: AgentName;
  state: TaskState;
  tool_used?: string;
  progress?: number;
  payload?: unknown;
  output?: unknown;
  error?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface EventRecord {
  id: string;
  topic: string;
  from_agent: AgentName;
  task_id?: string;
  data: Record<string, unknown>;
  webhooks: number;
  occurred_at: string;
}

export interface EnvelopeRecord {
  id: string;
  type: Envelope["type"];
  from_agent: AgentName;
  to_agent: AgentName;
  correlation_id?: string;
  payload: unknown;
  received_at: string;
}

export interface ChatMessage {
  id: string;
  chatId: string; // channel id like "general-swarm", "dev-scaffold", or direct agent id
  senderId: string;
  senderName: string;
  senderAvatarColor: string;
  text: string;
  code?: string;
  toolUsage?: { tool: string; status: "executing" | "completed"; durationMs?: number };
  canvasAttachment?: { type: "sheet" | "code" | "call" | "dag"; id: string; title: string };
  inlineButtons?: { text: string; action: string }[];
  timestamp: string;
  isOutgoing: boolean;
}

export interface SecondBrainItem {
  id: string;
  title: string;
  category: "doc" | "email" | "call" | "memory";
  source: string;
  snippet: string;
  tags: string[];
  updatedAt: string;
}

export interface CanvasItem {
  id: string;
  type: "sheet" | "code" | "deck";
  title: string;
  content: string; // JSON or code string
  lastModifiedBy: string;
  updatedAt: string;
}

export interface WorkflowTrigger {
  id: string;
  name: string;
  type: "interval" | "webhook" | "email";
  schedule: string;
  targetDirective: string;
  enabled: boolean;
  lastRun?: string;
  status: "idle" | "running" | "success" | "error";
}

export interface CallRecap {
  id: string;
  vendorName: string;
  phoneNumber: string;
  duration: string;
  status: "completed" | "scheduled" | "failed";
  audioUrl?: string;
  summary: string;
  transcript: { speaker: string; text: string; timestamp: string }[];
  actionItems: string[];
  createdAt: string;
}

export interface LemonadeModelSlot {
  id: string;
  name: string;
  backend: "ollama" | "lemonade" | "vllm" | "vertex";
  status: "active" | "standby" | "unloaded";
  vramUsageGb: number;
  contextWindow: number;
  tokensPerSec: number;
}

export interface LemonadeStatus {
  version: string;
  listeningPort: number;
  socketPath: string;
  hardware: {
    cpuLoad: number;
    gpuMemoryUsedGb: number;
    gpuMemoryTotalGb: number;
    npuAcceleration: boolean;
    npuDevice: string;
  };
  parameters: {
    temperature: number;
    topP: number;
    repeatPenalty: number;
    contextSize: number;
  };
  slots: LemonadeModelSlot[];
}

export class StateStore {
  private agents = new Map<string, AgentRecord>();
  private directives = new Map<string, DirectiveRecord>();
  private tasks = new Map<string, TaskRecord>();
  private events: EventRecord[] = [];
  private envelopes: EnvelopeRecord[] = [];
  private messages: ChatMessage[] = [];
  private secondBrain: SecondBrainItem[] = [];
  private canvases: CanvasItem[] = [];
  private triggers: WorkflowTrigger[] = [];
  private calls: CallRecap[] = [];
  private lemonade: LemonadeStatus = {
    version: "2.4.0",
    listeningPort: 3000,
    socketPath: "/tmp/coc-michael.sock",
    hardware: {
      cpuLoad: 14,
      gpuMemoryUsedGb: 5.4,
      gpuMemoryTotalGb: 16.0,
      npuAcceleration: true,
      npuDevice: "AMD Ryzen AI NPU + Discrete Vulkan Core",
    },
    parameters: {
      temperature: 0.7,
      topP: 0.9,
      repeatPenalty: 1.1,
      contextSize: 8192,
    },
    slots: [
      { id: "slot-01", name: "qwen2.5:7b (Primary Local)", backend: "ollama", status: "active", vramUsageGb: 4.8, contextWindow: 8192, tokensPerSec: 64.2 },
      { id: "slot-02", name: "gemini-2.0-flash (Seraphim Cloud)", backend: "vertex", status: "active", vramUsageGb: 0.0, contextWindow: 32768, tokensPerSec: 120.5 },
      { id: "slot-03", name: "mistral-large (Oracle 2)", backend: "vllm", status: "standby", vramUsageGb: 12.1, contextWindow: 16384, tokensPerSec: 42.1 },
      { id: "slot-04", name: "llama3.2:3b (NPU Accelerated)", backend: "lemonade", status: "standby", vramUsageGb: 2.2, contextWindow: 4096, tokensPerSec: 88.0 },
    ],
  };

  constructor() {
    this.seedAgents();
    this.seedDemoData();
    this.seedSecondBrain();
    this.seedCanvases();
    this.seedTriggers();
    this.seedCalls();
    this.seedTelegramMessages();
  }

  getLemonadeStatus(): LemonadeStatus {
    return { ...this.lemonade };
  }

  updateLemonadeParams(patch: Partial<LemonadeStatus["parameters"]>): LemonadeStatus {
    Object.assign(this.lemonade.parameters, patch);
    return { ...this.lemonade };
  }

  loadModelSlot(slotId: string): LemonadeStatus {
    this.lemonade.slots.forEach((s) => {
      if (s.id === slotId) s.status = "active";
      else if (s.status === "active") s.status = "standby";
    });
    return { ...this.lemonade };
  }

  // --- Agents Setup ---
  private seedAgents() {
    const list: AgentRecord[] = [
      {
        id: "yhwh",
        display_name: "YHWH / Ann (Operations Lead)",
        role_title: "Chief Reasoning & Planning Kernel",
        tier: "reason",
        description: "Triage coordinator and reasoning engine. Analyzes complex user intent and breaks requests into executable DAG execution trees.",
        provider: "ollama",
        model: process.env.YHWH_MODEL ?? "qwen2.5:7b",
        target_kinds: ["llm.reason"],
        status: "active",
        last_heartbeat: new Date().toISOString(),
        notes: "Primary orchestrating intelligence; local Ollama / Gemini fallback active",
        sort_order: 1,
      },
      {
        id: "michael",
        display_name: "Michael (Archangel Commander)",
        role_title: "Workflow Coordinator & State Machine",
        tier: "control",
        description: "Orchestration commander. Resolves task dependencies via Kahn topological sort, oversees worker threads, and dispatches via UDS/HTTP.",
        provider: "internal",
        model: "state-machine-v2",
        target_kinds: [],
        status: "active",
        last_heartbeat: new Date().toISOString(),
        notes: "Master daemon listening on /tmp/coc-michael.sock and port 3000",
        sort_order: 2,
      },
      {
        id: "metatron",
        display_name: "Metatron (The Divine Scribe)",
        role_title: "LLM Router & Multi-Model Gateway",
        tier: "gateway",
        description: "Manages routing to external Seraphim oracles. Executes consensus checks (70-80% threshold), first-response broadcasts, and cost optimization.",
        provider: "internal",
        model: "heuristic-classifier",
        target_kinds: ["llm.reason"],
        status: "active",
        last_heartbeat: new Date().toISOString(),
        notes: "Privilege guard & untrusted template sanitizer active",
        sort_order: 3,
      },
      {
        id: "raphael",
        display_name: "Raphael (Task Bot & Worker)",
        role_title: "Full-Stack Engineer & Automation Bot",
        tier: "work",
        description: "Hands-on builder. Generates code, scaffolds repositories, runs Drizzle/SQL migrations, runs linters, and operates interactive code sandboxes.",
        provider: "internal",
        model: "worker-pool-v1",
        target_kinds: ["file.scaffold", "db.migrate", "workspace.maintain"],
        status: "active",
        last_heartbeat: new Date().toISOString(),
        notes: "Execution sandbox & file scaffolding active",
        sort_order: 4,
      },
      {
        id: "gabriel",
        display_name: "Gabriel / Ryan (Comms & Marketing)",
        role_title: "Event Dispatcher & Webhook Messenger",
        tier: "comms",
        description: "Handles outbound integrations, real-time Slack/Discord announcements, webhook fanout, and email campaign pipelines.",
        provider: "internal",
        model: "fanout-engine",
        target_kinds: ["notify", "deliver_payload"],
        status: "active",
        last_heartbeat: new Date().toISOString(),
        notes: "GABRIEL_WEBHOOKS delivery queue operational",
        sort_order: 5,
      },
      {
        id: "seraphim",
        display_name: "Seraphim / Dwayne (Strategic Oracles)",
        role_title: "External Cloud LLM Council & Deep Research",
        tier: "external",
        description: "Cloud reasoning pool: Google Gemini 2.0 Flash / Vertex AI, OpenAI GPT-4o, Anthropic Claude 3.5, and Mistral Large.",
        provider: "vertex",
        model: process.env.SERAPHIM_MODEL ?? "gemini-2.0-flash",
        target_kinds: ["llm.reason"],
        status: "active",
        last_heartbeat: new Date().toISOString(),
        notes: "Multi-oracle consensus and deep analysis enabled",
        sort_order: 6,
      },
    ];

    for (const a of list) {
      this.agents.set(a.id, a);
    }
  }

  // --- Seed Second Brain Shared Memory ---
  private seedSecondBrain() {
    this.secondBrain = [
      {
        id: "sb-01",
        title: "Acquit Platform Core Architecture & Security Spec",
        category: "doc",
        source: "Architecture Blueprint §30",
        snippet: "Defines the 6-agent divine assembly, LLMRouter consensus mechanism, variable substitution with untrusted data sanitization, and data_sensitivity checks.",
        tags: ["architecture", "spec", "security", "privilege-guard"],
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: "sb-02",
        title: "PostgreSQL Database Schema: Auth Sessions & Tokens",
        category: "doc",
        source: "schema.ts v2.4",
        snippet: "Tables for users, session_tokens, api_keys, and audit_events with WAL journal mode and foreign key constraints.",
        tags: ["database", "schema", "auth", "sql"],
        updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
      {
        id: "sb-03",
        title: "Vendor Onboarding Call Transcript (Speakley Audio Recap)",
        category: "call",
        source: "Phone call via Speakley Companion",
        snippet: "Confirmed Cloud GPU cluster pricing at $0.0003/token with 99.9% uptime SLA and dedicated Unix domain socket bridge.",
        tags: ["vendor", "pricing", "gpu", "call-recap"],
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        id: "sb-04",
        title: "Weekly Security & Compliance Audit Log",
        category: "email",
        source: "security@company.com (Gmail sync)",
        snippet: "Zero CVEs reported in dependencies. Verified all attorney-client privileged inputs are kept off external public LLM endpoints.",
        tags: ["compliance", "audit", "security"],
        updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ];
  }

  // --- Seed Canvas Items (Sheets, Code Sandbox) ---
  private seedCanvases() {
    this.canvases = [
      {
        id: "cv-sheet-01",
        type: "sheet",
        title: "Competitor Model Latency & Cost Breakdown",
        content: JSON.stringify([
          { Provider: "Local Ollama (qwen2.5)", Latency: "120ms", CostPer1k: "$0.0000", Quality: "94%", ConsensusAgree: "Yes" },
          { Provider: "Gemini 2.0 Flash (Seraphim)", Latency: "240ms", CostPer1k: "$0.0001", Quality: "98%", ConsensusAgree: "Yes" },
          { Provider: "Claude 3.5 Sonnet", Latency: "580ms", CostPer1k: "$0.0030", Quality: "99%", ConsensusAgree: "Yes" },
          { Provider: "GPT-4o (OpenAI)", Latency: "490ms", CostPer1k: "$0.0025", Quality: "97%", ConsensusAgree: "Yes" },
          { Provider: "Mistral Large", Latency: "310ms", CostPer1k: "$0.0007", Quality: "95%", ConsensusAgree: "Yes" }
        ], null, 2),
        lastModifiedBy: "Metatron",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cv-code-01",
        type: "code",
        title: "src/auth/jwt_verifier.ts",
        content: `import { createHmac } from "node:crypto";

export interface TokenPayload {
  sub: string;
  role: "admin" | "agent" | "subscriber";
  permissions: string[];
  exp: number;
}

export function verifyJwt(token: string, secret: string): TokenPayload | null {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;

  const expectedSig = createHmac("sha256", secret)
    .update(\`\${header}.\${payload}\`)
    .digest("base64url");

  if (signature !== expectedSig) return null;

  const decoded: TokenPayload = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (Date.now() / 1000 > decoded.exp) return null;

  return decoded;
}

// Scaffolded autonomously by Raphael (Worker Bot)
console.log("[Raphael] JWT verifier initialized with HMAC-SHA256.");`,
        lastModifiedBy: "Raphael",
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  // --- Seed Automated Workflow Triggers ---
  private seedTriggers() {
    this.triggers = [
      {
        id: "trig-01",
        name: "Hourly Workspace & Lint Sanity Sweep",
        type: "interval",
        schedule: "Every 60 minutes",
        targetDirective: "Perform workspace maintenance with strict lint check and sanity review",
        enabled: true,
        lastRun: new Date(Date.now() - 1800000).toISOString(),
        status: "success",
      },
      {
        id: "trig-02",
        name: "Continuous Webhook Health Heartbeat",
        type: "interval",
        schedule: "Every 30 minutes",
        targetDirective: "Emit telemetry event and broadcast payload to external webhooks",
        enabled: true,
        lastRun: new Date(Date.now() - 900000).toISOString(),
        status: "success",
      },
      {
        id: "trig-03",
        name: "Nightly Database Backup & Migration Check",
        type: "interval",
        schedule: "Daily at 02:00 UTC",
        targetDirective: "Execute database schema migration and perform workspace maintenance",
        enabled: true,
        lastRun: new Date(Date.now() - 3600000 * 14).toISOString(),
        status: "idle",
      },
    ];
  }

  // --- Seed "Call for Me" Integration ---
  private seedCalls() {
    this.calls = [
      {
        id: "call-01",
        vendorName: "Apex Cloud Infrastructure",
        phoneNumber: "+1 (415) 890-2134",
        duration: "2m 14s",
        status: "completed",
        summary: "Confirmed dedicated high-throughput socket connections on port 3000 and reserved 4x H100 GPU nodes for Seraphim consensus workloads.",
        transcript: [
          { speaker: "Raphael (AI Agent)", text: "Hello! Calling on behalf of Empyrean GenTeam to confirm socket availability for our multi-agent daemon.", timestamp: "00:03" },
          { speaker: "Apex Support Representative", text: "Yes, your dedicated UDS and port 3000 endpoints are provisioned with 10Gbps loopback.", timestamp: "00:35" },
          { speaker: "Raphael (AI Agent)", text: "Excellent. Can you confirm the Seraphim fallback pipeline has priority bandwidth?", timestamp: "01:12" },
          { speaker: "Apex Support Representative", text: "Confirmed. SLA guarantee is 99.95% with automatic failover.", timestamp: "01:45" },
          { speaker: "Raphael (AI Agent)", text: "Thank you. Adding confirmation to team audit log.", timestamp: "02:05" }
        ],
        actionItems: [
          "Update Michael orchestrator socket timeout to 60s",
          "Log confirmed SLA into Second Brain compliance register"
        ],
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
    ];
  }

  // --- Seed Historical Directives, Tasks, and Events ---
  public seedDemoData() {
    const d1Id = "dir-auth-01";
    const d1: DirectiveRecord = {
      id: d1Id,
      text: "Scaffold JWT auth module, run DB migration, and notify Slack",
      context: { environment: "production", region: "us-east1" },
      planned_by: "yhwh",
      status: "succeeded",
      tree: {
        rootId: "t1-reason-auth",
        nodes: [
          {
            id: "t1-reason-auth",
            kind: "llm.reason",
            dependsOn: [],
            payload: { task: "Design JWT auth middleware spec and token refresh protocol" },
          },
          {
            id: "t2-scaffold-files",
            kind: "file.scaffold",
            dependsOn: ["t1-reason-auth"],
            payload: { path: "src/auth/jwt.ts", content: "export const verifyToken = () => true;" },
          },
          {
            id: "t3-migrate-db",
            kind: "db.migrate",
            dependsOn: ["t2-scaffold-files"],
            payload: { cmd: "npx drizzle-kit migrate", schema: "auth_sessions" },
          },
          {
            id: "t4-notify-slack",
            kind: "notify",
            dependsOn: ["t3-migrate-db"],
            payload: { channel: "#deploy-announcements", message: "Auth service upgraded to v2.4.0" },
          },
        ],
      },
      received_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      settled_at: new Date(Date.now() - 3600000 * 2 + 3420).toISOString(),
    };
    this.directives.set(d1Id, d1);

    this.tasks.set("t1-reason-auth", {
      id: "t1-reason-auth",
      directive_id: d1Id,
      kind: "llm.reason",
      depends_on: [],
      routed_to: "metatron",
      state: "succeeded",
      tool_used: "MetatronRouter",
      progress: 100,
      payload: { task: "Design JWT auth middleware spec and token refresh protocol" },
      output: { spec: "HMAC-SHA256 with 15m expiration & secure refresh token rotation", tier: "yhwh" },
      created_at: d1.received_at,
      started_at: new Date(Date.now() - 3600000 * 2 + 100).toISOString(),
      completed_at: new Date(Date.now() - 3600000 * 2 + 820).toISOString(),
    });

    this.tasks.set("t2-scaffold-files", {
      id: "t2-scaffold-files",
      directive_id: d1Id,
      kind: "file.scaffold",
      depends_on: ["t1-reason-auth"],
      routed_to: "raphael",
      state: "succeeded",
      tool_used: "CodeGenTool",
      progress: 100,
      payload: { path: "src/auth/jwt.ts" },
      output: { written: "src/auth/jwt.ts", bytes: 1420 },
      created_at: d1.received_at,
      started_at: new Date(Date.now() - 3600000 * 2 + 830).toISOString(),
      completed_at: new Date(Date.now() - 3600000 * 2 + 1240).toISOString(),
    });

    this.tasks.set("t3-migrate-db", {
      id: "t3-migrate-db",
      directive_id: d1Id,
      kind: "db.migrate",
      depends_on: ["t2-scaffold-files"],
      routed_to: "raphael",
      state: "succeeded",
      tool_used: "DrizzleKitMigrate",
      progress: 100,
      payload: { cmd: "npx drizzle-kit migrate" },
      output: { stdout: "Migration 0004_create_auth_sessions applied cleanly [0.34s]" },
      created_at: d1.received_at,
      started_at: new Date(Date.now() - 3600000 * 2 + 1250).toISOString(),
      completed_at: new Date(Date.now() - 3600000 * 2 + 2580).toISOString(),
    });

    this.tasks.set("t4-notify-slack", {
      id: "t4-notify-slack",
      directive_id: d1Id,
      kind: "notify",
      depends_on: ["t3-migrate-db"],
      routed_to: "gabriel",
      state: "succeeded",
      tool_used: "WebhookFanout",
      progress: 100,
      payload: { channel: "#deploy-announcements", message: "Auth service upgraded to v2.4.0" },
      output: { topic: "notify", delivered: 2, endpoints: ["https://hooks.slack.com/services/demo"] },
      created_at: d1.received_at,
      started_at: new Date(Date.now() - 3600000 * 2 + 2590).toISOString(),
      completed_at: d1.settled_at,
    });

    // Seed events
    this.events = [
      {
        id: "evt-01",
        topic: "directive.received",
        from_agent: "michael",
        task_id: "t1-reason-auth",
        data: { directive: d1.text, plannedNodes: 4 },
        webhooks: 1,
        occurred_at: d1.received_at,
      },
      {
        id: "evt-02",
        topic: "file.scaffold.completed",
        from_agent: "raphael",
        task_id: "t2-scaffold-files",
        data: { path: "src/auth/jwt.ts", bytes: 1420 },
        webhooks: 0,
        occurred_at: new Date(Date.now() - 3600000 * 2 + 1240).toISOString(),
      },
      {
        id: "evt-03",
        topic: "db.migrate.success",
        from_agent: "raphael",
        task_id: "t3-migrate-db",
        data: { migration: "0004_create_auth_sessions", durationMs: 340 },
        webhooks: 1,
        occurred_at: new Date(Date.now() - 3600000 * 2 + 2580).toISOString(),
      },
      {
        id: "evt-04",
        topic: "notify.dispatched",
        from_agent: "gabriel",
        task_id: "t4-notify-slack",
        data: { channel: "#deploy-announcements", delivered: 2 },
        webhooks: 2,
        occurred_at: d1.settled_at!,
      },
    ];

    // Seed envelopes
    this.envelopes = [
      {
        id: "env-101",
        type: "directive",
        from_agent: "external",
        to_agent: "michael",
        correlation_id: "corr-101",
        payload: { text: d1.text },
        received_at: d1.received_at,
      },
      {
        id: "env-102",
        type: "query",
        from_agent: "michael",
        to_agent: "yhwh",
        correlation_id: "corr-101",
        payload: { directive: d1.text },
        received_at: new Date(Date.now() - 3600000 * 2 + 50).toISOString(),
      },
      {
        id: "env-103",
        type: "task",
        from_agent: "michael",
        to_agent: "raphael",
        correlation_id: "corr-101",
        payload: { kind: "file.scaffold", path: "src/auth/jwt.ts" },
        received_at: new Date(Date.now() - 3600000 * 2 + 825).toISOString(),
      },
      {
        id: "env-104",
        type: "task_result",
        from_agent: "raphael",
        to_agent: "michael",
        correlation_id: "corr-101",
        payload: { taskId: "t2-scaffold-files", state: "succeeded" },
        received_at: new Date(Date.now() - 3600000 * 2 + 1240).toISOString(),
      },
    ];
  }

  // --- Seed Telegram Messages ---
  private seedTelegramMessages() {
    this.messages = [
      {
        id: "msg-001",
        chatId: "general-swarm",
        senderId: "yhwh",
        senderName: "YHWH / Ann (Operations Lead)",
        senderAvatarColor: "#818cf8",
        text: "⚡ GenTeam operational. I am actively monitoring our channels. Direct the swarm with any engineering, marketing, or research goals.",
        inlineButtons: [
          { text: "⚡ Scaffold Auth System", action: "preset:auth" },
          { text: "🗄️ Run Schema Migration", action: "preset:migrate" },
          { text: "🔍 Metatron Consensus (80%)", action: "preset:consensus" },
          { text: "📞 Call For Me (Apex Vendor)", action: "preset:call" }
        ],
        timestamp: "10:14",
        isOutgoing: false,
      },
      {
        id: "msg-002",
        chatId: "general-swarm",
        senderId: "user",
        senderName: "You",
        senderAvatarColor: "#2481cc",
        text: "Scaffold JWT auth module, run DB migration, and notify Slack channel",
        timestamp: "10:15",
        isOutgoing: true,
      },
      {
        id: "msg-003",
        chatId: "general-swarm",
        senderId: "yhwh",
        senderName: "YHWH / Ann",
        senderAvatarColor: "#818cf8",
        text: "Decomposed into 4 execution nodes. Michael will orchestrate the DAG.",
        canvasAttachment: { type: "dag", id: "dir-auth-01", title: "ExecutionTree (4 Nodes)" },
        timestamp: "10:15",
        isOutgoing: false,
      },
      {
        id: "msg-004",
        chatId: "general-swarm",
        senderId: "raphael",
        senderName: "Raphael (Task Bot)",
        senderAvatarColor: "#f59e0b",
        text: "Delivered file scaffold to `src/auth/jwt.ts` and executed DB migration via Drizzle.",
        toolUsage: { tool: "CodeGenTool + DrizzleKitMigrate", status: "completed", durationMs: 420 },
        canvasAttachment: { type: "code", id: "cv-code-01", title: "src/auth/jwt_verifier.ts" },
        timestamp: "10:16",
        isOutgoing: false,
      },
      {
        id: "msg-005",
        chatId: "general-swarm",
        senderId: "gabriel",
        senderName: "Gabriel / Ryan (Comms)",
        senderAvatarColor: "#10b981",
        text: "Dispatched audit notification to 2 webhook endpoints (`#deploy-announcements`).",
        toolUsage: { tool: "WebhookFanout", status: "completed", durationMs: 180 },
        timestamp: "10:16",
        isOutgoing: false,
      },
    ];
  }

  // --- Chat Messages API ---
  getMessages(chatId = "general-swarm"): ChatMessage[] {
    return this.messages.filter((m) => m.chatId === chatId);
  }

  addMessage(msg: Omit<ChatMessage, "id">): ChatMessage {
    const record: ChatMessage = {
      ...msg,
      id: "msg-" + globalThis.crypto.randomUUID().slice(0, 8),
    };
    this.messages.push(record);
    return record;
  }

  // --- Second Brain API ---
  getSecondBrain(): SecondBrainItem[] {
    return [...this.secondBrain];
  }

  addSecondBrainItem(item: Omit<SecondBrainItem, "id" | "updatedAt">): SecondBrainItem {
    const record: SecondBrainItem = {
      ...item,
      id: "sb-" + globalThis.crypto.randomUUID().slice(0, 8),
      updatedAt: new Date().toISOString(),
    };
    this.secondBrain.unshift(record);
    return record;
  }

  // --- Canvases API ---
  getCanvases(): CanvasItem[] {
    return [...this.canvases];
  }

  getCanvas(id: string): CanvasItem | undefined {
    return this.canvases.find((c) => c.id === id);
  }

  updateCanvas(id: string, content: string, modifiedBy: string): CanvasItem | undefined {
    const c = this.canvases.find((item) => item.id === id);
    if (c) {
      c.content = content;
      c.lastModifiedBy = modifiedBy;
      c.updatedAt = new Date().toISOString();
    }
    return c;
  }

  // --- Triggers API ---
  getTriggers(): WorkflowTrigger[] {
    return [...this.triggers];
  }

  toggleTrigger(id: string): WorkflowTrigger | undefined {
    const t = this.triggers.find((tr) => tr.id === id);
    if (t) {
      t.enabled = !t.enabled;
    }
    return t;
  }

  // --- Calls API ---
  getCalls(): CallRecap[] {
    return [...this.calls];
  }

  // --- Agents API ---
  getAgents(): AgentRecord[] {
    return Array.from(this.agents.values()).sort((a, b) => a.sort_order - b.sort_order);
  }

  getAgent(id: AgentName): AgentRecord | undefined {
    return this.agents.get(id);
  }

  addAgent(agent: AgentRecord): AgentRecord {
    this.agents.set(agent.id, agent);
    return agent;
  }

  addCall(call: Omit<CallRecap, "id" | "createdAt">): CallRecap {
    const record: CallRecap = {
      ...call,
      id: "call-" + globalThis.crypto.randomUUID().slice(0, 8),
      createdAt: new Date().toISOString(),
    };
    this.calls.unshift(record);
    return record;
  }

  addCanvas(canvas: Omit<CanvasItem, "id" | "updatedAt">): CanvasItem {
    const record: CanvasItem = {
      ...canvas,
      id: "cv-" + globalThis.crypto.randomUUID().slice(0, 8),
      updatedAt: new Date().toISOString(),
    };
    this.canvases.unshift(record);
    return record;
  }

  // --- Directives API ---
  saveDirective(d: DirectiveRecord) {
    this.directives.set(d.id, d);
  }

  getDirectives(): DirectiveRecord[] {
    return Array.from(this.directives.values()).sort(
      (a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
    );
  }

  getDirective(id: string): DirectiveRecord | undefined {
    return this.directives.get(id);
  }

  // --- Tasks API ---
  getTasks(): TaskRecord[] {
    return Array.from(this.tasks.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  getTask(id: string): TaskRecord | undefined {
    return this.tasks.get(id);
  }

  upsertTask(t: {
    id: string;
    directive_id?: string;
    kind: TaskKind;
    state: TaskState;
    depends_on?: string[];
    routed_to?: AgentName;
    tool_used?: string;
    progress?: number;
    payload?: unknown;
  }) {
    const now = new Date().toISOString();
    const existing = this.tasks.get(t.id);

    let routedTo: AgentName = t.routed_to ?? "michael";
    if (!t.routed_to) {
      if (t.kind === "llm.reason") routedTo = "metatron";
      else if (t.kind === "notify" || t.kind === "deliver_payload") routedTo = "gabriel";
      else routedTo = "raphael";
    }

    const taskRecord: TaskRecord = {
      id: t.id,
      directive_id: t.directive_id ?? existing?.directive_id ?? "live-directive",
      kind: t.kind,
      state: t.state,
      depends_on: t.depends_on ?? existing?.depends_on ?? [],
      routed_to: routedTo,
      tool_used: t.tool_used ?? existing?.tool_used,
      progress: t.progress ?? (t.state === "succeeded" ? 100 : t.state === "running" ? 60 : 0),
      payload: t.payload ?? existing?.payload,
      output: existing?.output,
      error: existing?.error,
      created_at: existing?.created_at ?? now,
      started_at: t.state === "running" ? now : existing?.started_at,
      completed_at: existing?.completed_at,
    };

    this.tasks.set(t.id, taskRecord);
    void this.syncSupabase("tasks", { ...taskRecord, updatedAt: now });
  }

  completeTask(id: string, state: TaskState, output?: unknown, error?: string) {
    const now = new Date().toISOString();
    const existing = this.tasks.get(id);
    if (existing) {
      existing.state = state;
      existing.output = output;
      existing.error = error;
      existing.progress = state === "succeeded" ? 100 : existing.progress;
      existing.completed_at = now;
    }
    void this.syncSupabase("tasks", { id, state, output, error, updatedAt: now });
  }

  // --- Events API ---
  getEvents(): EventRecord[] {
    return [...this.events].reverse();
  }

  appendEvent(topic: string, data: Record<string, unknown>, from_agent: AgentName = "gabriel", task_id?: string, webhooks = 0) {
    const id = globalThis.crypto.randomUUID();
    const now = new Date().toISOString();
    const record: EventRecord = {
      id,
      topic,
      from_agent,
      task_id,
      data,
      webhooks,
      occurred_at: now,
    };
    this.events.push(record);
    void this.syncSupabase("events", record as unknown as Record<string, unknown>);
  }

  // --- Envelopes API ---
  getEnvelopes(): EnvelopeRecord[] {
    return [...this.envelopes].reverse();
  }

  recordEnvelope(env: Envelope) {
    const record: EnvelopeRecord = {
      id: env.id ?? globalThis.crypto.randomUUID(),
      type: env.type,
      from_agent: env.from,
      to_agent: env.to,
      correlation_id: env.correlationId,
      payload: env.payload,
      received_at: env.createdAt ?? new Date().toISOString(),
    };
    this.envelopes.push(record);
    if (this.envelopes.length > 500) {
      this.envelopes.shift();
    }
  }

  // --- Metrics ---
  getMetrics() {
    const tasks = Array.from(this.tasks.values());
    const succeeded = tasks.filter((t) => t.state === "succeeded").length;
    const failed = tasks.filter((t) => t.state === "failed").length;
    const running = tasks.filter((t) => t.state === "running").length;
    const pending = tasks.filter((t) => t.state === "pending").length;
    const fallback = tasks.filter((t) => t.state === "fallback").length;

    return {
      totalDirectives: this.directives.size,
      totalTasks: tasks.length,
      taskThroughput: {
        succeeded,
        failed,
        running,
        pending,
        fallback,
        successRate: tasks.length > 0 ? Math.round(((succeeded + fallback) / tasks.length) * 100) : 100,
      },
      totalEvents: this.events.length,
      totalEnvelopes: this.envelopes.length,
      activeAgents: Array.from(this.agents.values()).filter((a) => a.status === "active").length,
      secondBrainItems: this.secondBrain.length,
      activeTriggers: this.triggers.filter((t) => t.enabled).length,
    };
  }

  /** Fire-and-forget sync; failures never break the local path. */
  private async syncSupabase(table: string, row: Record<string, unknown>) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) return;
    try {
      await fetch(`${url}/rest/v1/${table}`, {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(row),
      });
    } catch (e) {
      log("warn", "michael", "supabase_sync_failed", { table, error: String(e) });
    }
  }
}
