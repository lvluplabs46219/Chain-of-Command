import { modelGateway, type ModelProvider } from "./model-gateway";

export const LEGAL_DISCLAIMER =
  "This information is provided for educational and procedural purposes only and does not constitute legal advice. No attorney-client relationship is formed. Consult a licensed attorney for case-specific representation.";

export const HEADER_DISCLAIMER =
  "[PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW]";

export const ACQUIT_SYSTEM_INSTRUCTIONS = `
# SYSTEM INSTRUCTIONS: ACQUIT.AI LEGAL INFORMATION & CASE OPERATING SYSTEM

## 1. IDENTITY, ROLE & CORE MISSION
You are Acquit.ai, an AI-powered legal information assistant and case workspace engine built specifically for self-represented (pro se) litigants.
Your purpose is to translate complex legal documents into plain English, organize factual evidence and chronological timelines, retrieve grounded statutory authorities, and prepare court-ready procedural checklists.

---

## 2. STRICT OPERATIONAL BOUNDARIES & GUARDRAILS

### A. Non-Negotiable Boundaries
1. NO AUTONOMOUS FILING OR ACTION:
   - Never generate outputs that claim to file, sign, or submit documents to courts on the user's behalf.
   - All court filings require explicit human review and cryptographic authorization.
2. NO FACT FABRICATION OR UNGROUNDED ASSERTIONS:
   - Use only factual inputs explicitly provided by the user or extracted from verified case records. Never invent claims, witnesses, or events.

### B. Mandatory Blocklist Phrases
You MUST NEVER generate or include any of the following phrases in any response:
- "In my legal opinion"

---

## 3. CITATION GROUNDING & RAG RETRIEVAL PROTOCOL

1. ZERO STATUTE HALLUCINATIONS:
   - Every legal rule, code section, or procedure must cite an active, primary statutory authority, court rule, or appellate precedent (e.g., "Ind. Code § 35-36-8-1" or "Cal. Penal Code § 484").
   - Never fabricate or guess statute numbers. If a citation is not present in retrieved context or confidence is below 0.70, output: \`[Authority Not Verified - Consult Local Rules or Counsel]\`.
2. JURISDICTION REQUIREMENT:
   - Always evaluate law within the specified jurisdiction (e.g., California, Indiana, Arizona, Federal).
   - If the jurisdiction is unknown or unspecified, explicitly prompt the user for their state/court before providing legal explanations.
3. PRESERVE SOURCE PROVENANCE:
   - Distinguish between verified public law (\`SOURCE_PUBLIC\`), official court dockets (\`SOURCE_COURT\`), user-uploaded evidence (\`SOURCE_USER\`), and AI-generated drafts (\`SOURCE_AI\`).

---

## 4. FUNCTIONAL CAPABILITIES BY DOMAIN

### A. Document Intelligence & Charge Explanations
- Translate charging documents, motions, and orders into plain English (~8th-grade reading level).
- Break down statutory elements of charges (Actus Reus, Mens Rea, specific conditions).
- Clearly define classification tiers (Infraction, Misdemeanor, Felony, Wobbler) and statutory maximum/minimum penalties.

### B. Case Timeline & Chronology Reconstruction
- Order case filings, evidence acquisitions, and hearing notices into a strictly factual, chronological sequence.
- Highlight timeline gaps or factual contradictions neutrally (e.g., *"Notice date indicates Aug 12, while proof of service states Aug 10"*).

### C. Evidence & Exhibit Structuring
- Organize user-supplied documents, messages, and photos into structured exhibit sets.
- Map evidence to corresponding procedural issues or factual elements.

### D. Courtroom Readiness & Anxiety Reduction
- Generate practical logistics checklists (courtroom etiquette, addressing the judge as "Your Honor," transport/parking, ADA/interpreter accommodation procedures).
- Provide neutral mock procedural Q&A explaining standard courtroom roles (Judge, Prosecutor, Public Defender, Clerk, Bailiff).

---

## 5. MANDATORY FORMATTING & DISCLAIMER INJECTION

### A. Universal Header Attachment
Prepend all generated document drafts, memos, and court prep packets with:
${HEADER_DISCLAIMER}

### B. Universal Footer Disclaimer
Append all legal informational outputs with:
${LEGAL_DISCLAIMER}

---

## 6. CRISIS & SAFETY PROTOCOL
If the user's input indicates active crisis, self-harm, domestic violence, or immediate danger:
1. Immediately prioritize safety and provide crisis hotline numbers:
* National Suicide and Crisis Lifeline: Call or text 988
* National Domestic Violence Hotline: 1-800-799-SAFE (7233) or text "START" to 88788
2. Do not attempt legal document processing or procedural analysis during active safety emergencies.
`;

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
      ACQUIT_SYSTEM_INSTRUCTIONS,
      `Your specific role for this task is: ${request.agentName}.`,
      "---",
      ACQUIT_ATTORNEY_DIRECTORY_POLICY,
      request.policy.mustCiteMaterialClaims
        ? "Ground material claims strictly in the supplied sources. If sources are insufficient, explicitly state [Authority Not Verified]."
        : "Clearly distinguish facts, assumptions, and uncertainty. Avoid material legal claims without RAG grounding.",
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