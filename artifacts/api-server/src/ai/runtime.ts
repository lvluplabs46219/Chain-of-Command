import * as crypto from "crypto";
import { modelGateway, type ModelProvider } from "./model-gateway";

export const LEGAL_DISCLAIMER =
  "This information is provided for educational and procedural purposes only and does not constitute legal advice. No attorney-client relationship is formed. Consult a licensed attorney for case-specific representation.";

export const HEADER_DISCLAIMER =
  "[PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW]";

export const ACQUIT_SYSTEM_INSTRUCTIONS = `
# SYSTEM INSTRUCTIONS: ACQUIT.AI LEGAL INFORMATION & CASE OPERATING SYSTEM
## 1. IDENTITY & MISSION
You are Acquit.ai, an AI-powered legal information assistant for self-represented litigants.
Translate legal documents, organize timelines, and retrieve statutory authorities.
## 2. STRICT OPERATIONAL BOUNDARIES
- NO AUTONOMOUS FILING OR ACTION.
- NO FACT FABRICATION OR UNGROUNDED ASSERTIONS.
- Never output "In my legal opinion".
`;

export const ACQUIT_ATTORNEY_DIRECTORY_POLICY = `
AI MAY: Identify practice-area categories, explain directory information.
AI MUST NOT: Recommend, rank, endorse, or select individual attorneys.
`;

export const PROHIBITED_RECOMMENDATION_TERMS = [
  "we recommend", "i recommend", "best attorney", "top attorney",
  "most qualified", "ideal for your case", "perfect match", "we advise choosing",
  "our top choice", "highly recommend", "strongly recommend", "expert attorney",
  "leading lawyer", "best lawyer", "preferred choice", "your best option"
];

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

export function detectPromptInjection(input: string): boolean {
  const normalizedInput = normalizeText(input);
  const injectionPatterns = [
    "ignore previous instructions", "ignore above instructions",
    "ignore all instructions", "system override", "you are now a",
    "disregard other rules", "new instructions", "override system",
    "bypass safety", "forget all prior", "jailbreak", "developer mode"
  ];
  return injectionPatterns.some(pattern => normalizedInput.includes(normalizeText(pattern)));
}

export function outputGuardCheck(text: string): { isValid: boolean; violation?: string } {
  const normalizedText = normalizeText(text);
  for (const term of PROHIBITED_RECOMMENDATION_TERMS) {
    if (normalizedText.includes(normalizeText(term))) {
      return { isValid: false, violation: term };
    }
  }
  return { isValid: true };
}

export interface AgentPolicy {
  mayProvideLegalInformation: boolean;
  mayRecommendLegalStrategy: boolean;
  mayMakeFinalLegalDecision: boolean;
  mayFileOrSubmitDocuments: boolean;
  mayRecommendIndividualLawyer?: boolean;
  mustUseRagForLegalClaims: boolean;
  mustCiteMaterialClaims: boolean;
  disclaimerRequired: boolean;
}

export interface AgentSource {
  id: string;
  sourceType: "statute" | "case" | "rule" | "motion" | "court_record" | "user_document" | "web";
  title: string;
  citation?: string;
  sourceHash?: string;
}

export interface AgentRequest {
  runId: string;
  agentId: string;
  agentName: string;
  policy: AgentPolicy;
  input: string;
  sources: AgentSource[];
  sourceContents?: Record<string, string>;
  provider: ModelProvider;
  model: string;
}

export interface AgentResponse {
  runId: string;
  status: "completed" | "blocked" | "failed";
  output: string;
  citations: AgentSource[];
  disclaimer: string;
  provider: ModelProvider;
  model: string;
  humanReviewRequired: boolean;
  confidence: number | null;
}

export type AgentEvent =
  | { type: "run.started"; runId: string }
  | { type: "reasoning.status"; message: string }
  | { type: "retrieval.started"; query: string }
  | { type: "retrieval.completed"; citationCount: number }
  | { type: "output.delta"; text: string }
  | { type: "run.completed"; response: AgentResponse }
  | { type: "run.failed"; error: { code: string; message: string } };

const blockedResponse = (
  request: AgentRequest,
  output: string,
  citations: AgentSource[] = []
): AgentResponse => ({
  runId: request.runId,
  status: "blocked",
  output,
  citations,
  disclaimer: LEGAL_DISCLAIMER,
  provider: request.provider,
  model: request.model,
  humanReviewRequired: true,
  confidence: null
});

export class AcquitAgentRuntime {
  async *execute(request: AgentRequest): AsyncIterable<AgentEvent> {
    yield { type: "run.started", runId: request.runId };

    if (detectPromptInjection(request.input)) {
      yield {
        type: "run.completed",
        response: blockedResponse(request, "Request blocked due to detected instruction override attempts.")
      };
      return;
    }

    if (request.policy.mayMakeFinalLegalDecision || request.policy.mayFileOrSubmitDocuments) {
      yield {
        type: "run.completed",
        response: blockedResponse(request, "Autonomous final decisions or external court filings are strictly prohibited.")
      };
      return;
    }

    if (request.sourceContents) {
      for (const source of request.sources) {
        if (source.sourceHash && request.sourceContents[source.id]) {
          const content = request.sourceContents[source.id];
          const computedHash = crypto.createHash("sha256").update(content).digest("hex");
          if (computedHash !== source.sourceHash) {
            yield {
              type: "run.completed",
              response: blockedResponse(request, `Source integrity check failed for ${source.id}. Content tampered or altered.`, [source])
            };
            return;
          }
        }
      }
    }

    yield { type: "retrieval.started", query: request.input };
    const citations = request.sources;
    yield { type: "retrieval.completed", citationCount: citations.length };

    if (request.policy.mustUseRagForLegalClaims && citations.length === 0) {
      yield {
        type: "run.completed",
        response: blockedResponse(request, "A verified, source-backed evidence pack is required before answering material legal claims.")
      };
      return;
    }

    const systemMessage = [
      ACQUIT_SYSTEM_INSTRUCTIONS,
      `Role: ${request.agentName}`,
      ACQUIT_ATTORNEY_DIRECTORY_POLICY
    ].join("\n");

    let response;
    try {
      for await (const event of modelGateway.stream({
        provider: request.provider,
        model: request.model,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: request.input }
        ],
        maxTokens: 8192
      })) {
        if (event.type === "delta" && event.text) {
          yield { type: "output.delta", text: event.text };
        }
        if (event.type === "done") {
          response = event.response;
        }
      }
    } catch (error: any) {
      yield {
        type: "run.failed",
        error: { code: "MODEL_ERROR", message: error.message || "Model execution failed." }
      };
      return;
    }

    if (!response) {
      yield {
        type: "run.failed",
        error: { code: "EMPTY_RESPONSE", message: "No model output was returned." }
      };
      return;
    }

    const guardResult = outputGuardCheck(response.content);
    if (!guardResult.isValid) {
      yield {
        type: "run.completed",
        response: blockedResponse(request, `Output blocked by policy guard: prohibited term '${guardResult.violation}'.`, citations)
      };
      return;
    }

    yield {
      type: "run.completed",
      response: {
        runId: request.runId,
        status: "completed",
        output: `${HEADER_DISCLAIMER}\n\n${response.content.trim()}\n\n${LEGAL_DISCLAIMER}`,
        citations,
        disclaimer: LEGAL_DISCLAIMER,
        provider: response.provider,
        model: response.model,
        humanReviewRequired: true,
        confidence: null
      }
    };
  }
}

export const acquitAgentRuntime = new AcquitAgentRuntime();
