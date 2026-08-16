import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";

export const AiRunRequest = z.object({
  agentId: z.string(),
  provider: z.enum(["demo", "ollama", "openai"]).optional(),
  model: z.string().optional(),
  input: z.string(),
  sources: z.array(z.any()).optional()
});

export const AiRunResponse = z.object({
  runId: z.string(),
  status: z.string(),
  streamUrl: z.string(),
  disclaimer: z.string(),
  humanReviewRequired: z.boolean()
});
import { acquitAgentRuntime, LEGAL_DISCLAIMER, type AgentEvent, type AgentPolicy, type AgentSource } from "../ai/runtime";
import type { ModelProvider } from "../ai/model-gateway";

const router: IRouter = Router();

interface RunRecord {
  events: AgentEvent[];
  done: boolean;
  listeners: Set<(event: AgentEvent) => void>;
  request: ReturnType<typeof AiRunRequest.parse>;
}

const runs = new Map<string, RunRecord>();

const defaultPolicies: Record<string, { name: string; policy: AgentPolicy }> = {
  "lead-counsel": {
    name: "Lead Counsel",
    policy: {
      mayProvideLegalInformation: true,
      mayRecommendLegalStrategy: true,
      mayMakeFinalLegalDecision: false,
      mayFileOrSubmitDocuments: false,
      mayRecommendIndividualLawyer: false,
      mustUseRagForLegalClaims: true,
      mustCiteMaterialClaims: true,
      disclaimerRequired: true,
    },
  },
  paralegal: {
    name: "Paralegal",
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
  researcher: {
    name: "Legal Researcher",
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
  const agent = defaultPolicies[record.request.agentId] ?? defaultPolicies["paralegal"];
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
    for (const listener of record.listeners) record.listeners.delete(listener);
  }
}

router.post("/ai/agents/:agentId/runs", (req: Request, res: Response) => {
  const parsed = AiRunRequest.safeParse({
    ...req.body,
    agentId: req.params.agentId,
  });

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid AI run request.", issues: parsed.error.issues });
    return;
  }

  const runId = crypto.randomUUID();
  const record: RunRecord = {
    events: [],
    done: false,
    listeners: new Set(),
    request: parsed.data,
  };
  runs.set(runId, record);
  void executeRun(runId, record);

  const response = AiRunResponse.parse({
    runId,
    status: "queued",
    streamUrl: `/api/ai/runs/${runId}/stream`,
    disclaimer: LEGAL_DISCLAIMER,
    humanReviewRequired: true,
  });
  res.status(202).json(response);
});

router.get("/ai/runs/:runId/stream", (req: Request, res: Response) => {
  const runId = String(req.params.runId);
  const record = runs.get(runId);

  if (!record) {
    res.status(404).json({ message: "AI run not found." });
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
    record.listeners.delete(listener);
  });
});

export default router;