import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { acquitAgentRuntime, LEGAL_DISCLAIMER, type AgentEvent, type AgentPolicy, type AgentSource, detectPromptInjection } from "../ai/runtime";
import type { ModelProvider } from "../ai/model-gateway";
import { Redis } from "@upstash/redis";
import crypto from "crypto";
import { AuthenticatedRequest } from "../middleware/verifySession";

export const SPECIALIST_AGENTS: Record<string, { name: string; roleDescription: string; policy: AgentPolicy }> = {
  "lead-counsel": {
    name: "Lead Counsel Coordinator",
    roleDescription: "Decomposes complex litigation objectives, coordinates specialist sub-agents, and synthesizes unified procedural workspaces.",
    policy: {
      mayProvideLegalInformation: true,
      mayRecommendLegalStrategy: false,
      mayMakeFinalLegalDecision: false,
      mayFileOrSubmitDocuments: false,
      mayRecommendIndividualLawyer: false,
      mustUseRagForLegalClaims: true,
      mustCiteMaterialClaims: true,
      disclaimerRequired: true,
    },
  },
  "paralegal": {
    name: "Paralegal AI",
    roleDescription: "Calculates statutory court deadlines, reviews formatting rules, and prepares procedural filing checklists.",
    policy: {
      mayProvideLegalInformation: true,
      mayRecommendLegalStrategy: false,
      mayMakeFinalLegalDecision: false,
      mayFileOrSubmitDocuments: false,
      mayRecommendIndividualLawyer: false,
      mustUseRagForLegalClaims: true,
      mustCiteMaterialClaims: true,
      disclaimerRequired: true,
    },
  },
  "investigator": {
    name: "Investigator AI",
    roleDescription: "Analyzes chronological records, detects factual contradictions in police reports, and highlights timeline gaps.",
    policy: {
      mayProvideLegalInformation: true,
      mayRecommendLegalStrategy: false,
      mayMakeFinalLegalDecision: false,
      mayFileOrSubmitDocuments: false,
      mayRecommendIndividualLawyer: false,
      mustUseRagForLegalClaims: true,
      mustCiteMaterialClaims: true,
      disclaimerRequired: true,
    },
  },
  "evidence-analyst": {
    name: "Evidence Analyst AI",
    roleDescription: "Indexes exhibits, evaluates chain-of-custody metadata, and maps tangible evidence directly to statutory elements.",
    policy: {
      mayProvideLegalInformation: true,
      mayRecommendLegalStrategy: false,
      mayMakeFinalLegalDecision: false,
      mayFileOrSubmitDocuments: false,
      mayRecommendIndividualLawyer: false,
      mustUseRagForLegalClaims: true,
      mustCiteMaterialClaims: true,
      disclaimerRequired: true,
    },
  },
  "court-prep": {
    name: "Court Preparation AI",
    roleDescription: "Generates 1-page court appearance prep sheets, courtroom etiquette guidelines, and procedural question outlines.",
    policy: {
      mayProvideLegalInformation: true,
      mayRecommendLegalStrategy: false,
      mayMakeFinalLegalDecision: false,
      mayFileOrSubmitDocuments: false,
      mayRecommendIndividualLawyer: false,
      mustUseRagForLegalClaims: true,
      mustCiteMaterialClaims: true,
      disclaimerRequired: true,
    },
  },
  "rights-checker": {
    name: "Rights Checker AI",
    roleDescription: "Audits law enforcement encounters against Fourth, Fifth, and Sixth Amendment procedural guarantees.",
    policy: {
      mayProvideLegalInformation: true,
      mayRecommendLegalStrategy: false,
      mayMakeFinalLegalDecision: false,
      mayFileOrSubmitDocuments: false,
      mayRecommendIndividualLawyer: false,
      mustUseRagForLegalClaims: true,
      mustCiteMaterialClaims: true,
      disclaimerRequired: true,
    },
  },
  "charge-explainer": {
    name: "Charge Explainer AI",
    roleDescription: "Translates criminal charging affidavits and statutory degrees into plain-language factual element trees.",
    policy: {
      mayProvideLegalInformation: true,
      mayRecommendLegalStrategy: false,
      mayMakeFinalLegalDecision: false,
      mayFileOrSubmitDocuments: false,
      mayRecommendIndividualLawyer: false,
      mustUseRagForLegalClaims: true,
      mustCiteMaterialClaims: true,
      disclaimerRequired: true,
    },
  },
};

const AgentSourceSchema = z.object({
  id: z.string(),
  content: z.string(),
  url: z.string().url().optional(),
  metadata: z.any().optional(),
}).strict();

export const AiRunRequest = z.object({
  agentId: z.enum(Object.keys(SPECIALIST_AGENTS) as [string, ...string[]]),
  provider: z.enum(["demo", "ollama", "openai", "gemini"]).optional(),
  model: z.string().optional(),
  input: z.string(),
  sources: z.array(AgentSourceSchema).optional(),
  matterId: z.string().optional(),
});

export const AiRunResponse = z.object({
  runId: z.string(),
  status: z.string(),
  streamUrl: z.string(),
  disclaimer: z.string(),
  humanReviewRequired: z.boolean(),
  agentName: z.string().optional(),
});

const router: IRouter = Router();

interface RunRecord {
  events: AgentEvent[];
  done: boolean;
  listeners: Set<(event: AgentEvent) => void>;
  request: z.infer<typeof AiRunRequest>;
  createdAt: number;
  ownerUserId: string; // CRITICAL: Track owner for authorization
}

// In-memory active stream listeners map
const memoryRuns = new Map<string, RunRecord>();

// Upstash Redis instance with 60-min TTL
let redisClient: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Helper to save run events with 60 min TTL
async function persistRunState(runId: string, record: RunRecord): Promise<void> {
  if (!redisClient) return;
  try {
    const payload = {
      runId,
      events: record.events,
      done: record.done,
      request: record.request,
      createdAt: record.createdAt,
      ownerUserId: record.ownerUserId, // CRITICAL: Persist owner
    };
    await redisClient.set(`agent_run:${runId}`, JSON.stringify(payload), { ex: 3600 });
  } catch (err) {
    console.warn("Redis run state persistence warning:", err);
  }
}

function writeEvent(res: Response, event: AgentEvent): void {
  res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
}

async function executeRun(runId: string, record: RunRecord): Promise<void> {
  const agent = SPECIALIST_AGENTS[record.request.agentId];
  const provider = (record.request.provider ?? "demo") as ModelProvider;
  const sources = (record.request.sources ?? []) as unknown as AgentSource[];

  // Check for prompt injection in the input
  if (detectPromptInjection(record.request.input)) {
    record.events.push({
      type: 'error',
      timestamp: Date.now(),
      payload: { error: 'Prompt injection detected - request aborted' },
    });
    record.done = true;
    await persistRunState(runId, record);
    for (const listener of record.listeners) listener(record.events[record.events.length - 1]);
    return;
  }

  try {
    for await (const event of acquitAgentRuntime.execute({
      runId,
      agentId: record.request.agentId,
      agentName: agent.name,
      policy: agent.policy,
      input: record.request.input,
      sources,
      provider,
      model: record.request.model ?? (provider === "ollama" ? "llama3.2" : "acquit-demo-1"),
    })) {
      record.events.push(event);
      for (const listener of record.listeners) listener(event);
    }
  } finally {
    record.done = true;
    void persistRunState(runId, record);
    for (const listener of record.listeners) record.listeners.delete(listener);
    setTimeout(() => {
      memoryRuns.delete(runId);
    }, 5 * 60 * 1000);
  }
}

// Get directory of specialist agents
router.get("/ai/agents", (_req: Request, res: Response) => {
  const list = Object.entries(SPECIALIST_AGENTS).map(([id, meta]) => ({
    id,
    name: meta.name,
    description: meta.roleDescription,
    disclaimerRequired: meta.policy.disclaimerRequired,
    mustCiteMaterialClaims: meta.policy.mustCiteMaterialClaims,
  }));
  return res.json({ agents: list });
});

// Launch an AI agent run - requires authentication
router.post("/ai/agents/:agentId/runs", (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  
  if (!user || !user.id) {
    return res.status(401).json({ message: "Unauthorized: User not authenticated" });
  }
  
  const parsed = AiRunRequest.safeParse({
    ...req.body,
    agentId: req.params.agentId,
  });

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid AI run request.", issues: parsed.error.issues });
  }

  // Check for prompt injection before creating the run
  if (detectPromptInjection(parsed.data.input)) {
    console.warn(`Prompt injection detected in AI run request from user ${user.id}`);
    return res.status(400).json({ message: "Invalid input - request rejected" });
  }

  const runId = crypto.randomUUID();
  const record: RunRecord = {
    events: [],
    done: false,
    listeners: new Set(),
    request: parsed.data,
    createdAt: Date.now(),
    ownerUserId: user.id, // CRITICAL: Store the authenticated user's ID
  };

  memoryRuns.set(runId, record);
  void executeRun(runId, record);

  const agent = SPECIALIST_AGENTS[parsed.data.agentId];

  const response = AiRunResponse.parse({
    runId,
    status: "queued",
    streamUrl: `/api/ai/runs/${runId}/stream`,
    disclaimer: LEGAL_DISCLAIMER,
    humanReviewRequired: true,
    agentName: agent.name,
  });

  return res.status(202).json(response);
});

// Stream real-time agent output with SSE
// CRITICAL: Verify that the requesting user matches the owner
router.get("/ai/runs/:runId/stream", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user;
  const runId = String(req.params.runId);
  
  if (!user || !user.id) {
    res.status(401).json({ message: "Unauthorized: User not authenticated" });
    return;
  }
  
  let record = memoryRuns.get(runId);

  // If not in local memory, check Redis store for completed run
  if (!record && redisClient) {
    try {
      const cached = await redisClient.get<string>(`agent_run:${runId}`);
      if (cached) {
        const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
        record = {
          events: parsed.events || [],
          done: true,
          listeners: new Set(),
          request: parsed.request,
          createdAt: parsed.createdAt || Date.now(),
          ownerUserId: parsed.ownerUserId || '',
        };
      }
    } catch (err) {
      console.warn("Redis run fetch error:", err);
    }
  }

  if (!record) {
    res.status(404).json({ message: "AI run not found or expired." });
    return;
  }

  // CRITICAL SECURITY CHECK: Verify that the authenticated user matches the owner
  if (record.ownerUserId !== user.id) {
    console.warn(`User ${user.id} attempted to access run ${runId} owned by ${record.ownerUserId}`);
    res.status(403).json({ message: "Unauthorized: This AI run belongs to another user" });
    return;
  }

  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  for (const event of record.events) writeEvent(res, event);

  if (record.done) {
    res.end();
    return;
  }

  const listener = (event: AgentEvent) => writeEvent(res, event);
  record.listeners.add(listener);

  req.on("close", () => {
    record?.listeners.delete(listener);
  });
});

export default router;
