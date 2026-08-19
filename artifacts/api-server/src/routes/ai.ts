import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { acquitAgentRuntime, LEGAL_DISCLAIMER, type AgentEvent, type AgentPolicy, type AgentSource } from "../ai/runtime";
import type { ModelProvider } from "../ai/model-gateway";
import { Redis } from "@upstash/redis";
import crypto from "crypto";

export const AiRunRequest = z.object({
  agentId: z.string(),
  provider: z.enum(["demo", "ollama", "openai", "gemini"]).optional(),
  model: z.string().optional(),
  input: z.string(),
  sources: z.array(z.any()).optional(),
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
}

// In-memory active stream listeners map
const memoryRuns = new Map<string, RunRecord>();

// Upstash Redis instance with 60-min TTL (HIGH-1 resolution)
let redisClient: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Helper to save run events with 60 min TTL (3600s)
async function persistRunState(runId: string, record: RunRecord): Promise<void> {
  if (!redisClient) return;
  try {
    const payload = {
      runId,
      events: record.events,
      done: record.done,
      request: record.request,
      createdAt: record.createdAt,
    };
    await redisClient.set(`agent_run:${runId}`, JSON.stringify(payload), { ex: 3600 });
  } catch (err) {
    console.warn("Redis run state persistence warning:", err);
  }
}

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

function writeEvent(res: Response, event: AgentEvent): void {
  res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
}

async function executeRun(runId: string, record: RunRecord): Promise<void> {
  const agent = SPECIALIST_AGENTS[record.request.agentId] ?? SPECIALIST_AGENTS["paralegal"];
  const provider = (record.request.provider ?? "demo") as ModelProvider;
  const sources = (record.request.sources ?? []) as AgentSource[];

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

// Launch an AI agent run
router.post("/ai/agents/:agentId/runs", (req: Request, res: Response) => {
  const parsed = AiRunRequest.safeParse({
    ...req.body,
    agentId: req.params.agentId,
  });

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid AI run request.", issues: parsed.error.issues });
  }

  const runId = crypto.randomUUID();
  const record: RunRecord = {
    events: [],
    done: false,
    listeners: new Set(),
    request: parsed.data,
    createdAt: Date.now(),
  };

  memoryRuns.set(runId, record);
  void executeRun(runId, record);

  const agent = SPECIALIST_AGENTS[parsed.data.agentId] ?? SPECIALIST_AGENTS["paralegal"];

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
router.get("/ai/runs/:runId/stream", async (req: Request, res: Response): Promise<void> => {
  const runId = String(req.params.runId);
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
