import { modelGateway, type ModelProvider } from "./model-gateway";

export const LEGAL_DISCLAIMER =
  "This information is for educational purposes only and does not constitute legal advice. Consult a licensed attorney in your jurisdiction.";

export const ACQUIT_ATTORNEY_DIRECTORY_POLICY = `
ACQUIT ATTORNEY DIRECTORY POLICY:
AI MAY:
✓ Identify relevant practice-area categories
✓ Identify jurisdiction requirements
✓ Explain different types of attorneys
✓ Help users formulate search criteria
✓ Explain directory information
✓ Display user-selected filters
✓ Display attorney-provided profiles

AI MUST NOT:
✗ Recommend an individual attorney
✗ Rank attorneys
✗ Endorse an attorney
✗ Claim an attorney is "best"
✗ Determine attorney competence
✗ Select an attorney for the user
✗ Favor an attorney because they paid Acquit
✗ Represent paid placement as an AI recommendation
`;

export const PROHIBITED_RECOMMENDATION_TERMS = [
  "we recommend",
  "i recommend",
  "best attorney",
  "top attorney",
  "most qualified",
  "ideal for your case",
  "perfect match",
  "we advise choosing",
  "our top choice",
];

export function outputGuardCheck(text: string): { isValid: boolean; violation?: string } {
  const lower = text.toLowerCase();
  for (const term of PROHIBITED_RECOMMENDATION_TERMS) {
    if (lower.includes(term)) {
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
  pinpoint?: string;
  sourceHash?: string;
}

export interface AgentRequest {
  runId: string;
  agentId: string;
  agentName: string;
  policy: AgentPolicy;
  input: string;
  sources: AgentSource[];
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
  confidence?: number;
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
  citations: AgentSource[] = [],
): AgentResponse => ({
  runId: request.runId,
  status: "blocked",
  output,
  citations,
  disclaimer: LEGAL_DISCLAIMER,
  provider: request.provider,
  model: request.model,
  humanReviewRequired: true,
});

export class AcquitAgentRuntime {
  async *execute(request: AgentRequest): AsyncIterable<AgentEvent> {
    yield { type: "run.started", runId: request.runId };
    yield {
      type: "reasoning.status",
      message: `Routing this request to ${request.agentName}.`,
    };

    if (request.policy.mayMakeFinalLegalDecision) {
      yield {
        type: "run.completed",
        response: blockedResponse(
          request,
          "This agent is blocked because Acquit.ai agents may not make a final legal decision. I can explain options, organize facts, and prepare questions for a licensed attorney.",
        ),
      };
      return;
    }

    if (request.policy.mayFileOrSubmitDocuments) {
      yield {
        type: "run.completed",
        response: blockedResponse(
          request,
          "This agent is blocked from filing or submitting documents. Acquit.ai can help prepare a draft for your review, but an external filing always requires a human-controlled step.",
        ),
      };
      return;
    }

    if (request.policy.mayRecommendIndividualLawyer) {
      yield {
        type: "run.completed",
        response: blockedResponse(
          request,
          "Acquit.ai hard policy: AI may identify practice areas and search criteria, but may NEVER select, rank, endorse, or recommend an individual attorney or law firm.",
        ),
      };
      return;
    }

    yield { type: "retrieval.started", query: request.input };
    const citations = request.sources;
    yield { type: "retrieval.completed", citationCount: citations.length };

    if (request.policy.mustUseRagForLegalClaims && citations.length === 0) {
      yield {
        type: "run.completed",
        response: blockedResponse(
          request,
          "I need a source-backed evidence pack before I can answer a material legal question. Attach a court record, legal authority, or user document and try again.",
        ),
      };
      return;
    }

    yield {
      type: "reasoning.status",
      message: citations.length
        ? `Grounding the response in ${citations.length} supplied source${citations.length === 1 ? "" : "s"}.`
        : "Preparing an educational response without a material legal claim.",
    };

    const systemMessage = [
      `You are ${request.agentName} inside Acquit.ai.`,
      "Provide educational legal information only. Do not make final decisions or take external actions.",
      ACQUIT_ATTORNEY_DIRECTORY_POLICY,
      "CRITICAL RULE: Never endorse, rank, or recommend specific individual attorneys or law firms. If the user asks for a lawyer, identify the required practice area, jurisdiction, and search criteria (e.g. 'criminal defense and felony matters in Marion County, Indiana'), then direct them to use the Acquit Attorney Directory filters.",
      request.policy.mustCiteMaterialClaims
        ? "Ground material claims in the supplied sources."
        : "Clearly distinguish facts, assumptions, and uncertainty.",
      request.policy.disclaimerRequired ? LEGAL_DISCLAIMER : "",
    ]
      .filter(Boolean)
      .join("\n");

    let response;
    try {
      for await (const event of modelGateway.stream({
        provider: request.provider,
        model: request.model,
        messages: [
          { role: "system", content: systemMessage },
          {
            role: "user",
            content: `${request.input}\n\nSource titles:\n${citations.map((source) => `- ${source.title}`).join("\n") || "- None supplied"}`,
          },
        ],
        maxTokens: 8192,
      })) {
        if (event.type === "delta" && event.text) {
          yield { type: "output.delta", text: event.text };
        }
        if (event.type === "done") {
          response = event.response;
        }
        if (event.type === "error") {
          throw new Error(event.error?.message ?? "Model stream failed.");
        }
      }
    } catch (error) {
      yield {
        type: "run.failed",
        error: {
          code: "MODEL_UNAVAILABLE",
          message: error instanceof Error ? error.message : "The selected model is unavailable.",
        },
      };
      return;
    }

    if (!response) {
      yield {
        type: "run.failed",
        error: { code: "EMPTY_MODEL_RESPONSE", message: "The model returned no response." },
      };
      return;
    }

    const guardResult = outputGuardCheck(response.content);
    if (!guardResult.isValid) {
      yield {
        type: "run.completed",
        response: blockedResponse(
          request,
          `Output blocked by OutputGuard (prohibited term detected: "${guardResult.violation}"). Acquit AI Policy strictly forbids recommending, endorsing, or ranking individual attorneys.`,
        ),
      };
      return;
    }

    yield {
      type: "run.completed",
      response: {
        runId: request.runId,
        status: "completed",
        output: response.content,
        citations,
        disclaimer: LEGAL_DISCLAIMER,
        provider: response.provider,
        model: response.model,
        humanReviewRequired: true,
        confidence: citations.length ? 0.78 : 0.42,
      },
    };
  }
}

export const acquitAgentRuntime = new AcquitAgentRuntime();