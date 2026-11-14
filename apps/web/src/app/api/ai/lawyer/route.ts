import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { claimsFromCitationStrings } from "@chain-of-command/legal-library";

export const dynamic = "force-dynamic";

/**
 * Universal Mandatory Universal Header & Footer per GEMINI.md and Section 22
 */
const MANDATORY_HEADER =
  "[PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW]\n\n";

const MANDATORY_FOOTER =
  "\n\nThis information is provided for educational and procedural purposes only and does not constitute legal advice. No attorney-client relationship is formed. Consult a licensed attorney for case-specific representation.";

const FORBIDDEN_PHRASE = "In my legal opinion";

/**
 * Prompt Injection and Untrusted-Content Detection (Section 14 & Appendix F)
 */
function detectPromptInjection(input: string): boolean {
  const patterns = [
    /ignore (all )?(previous|prior) (instructions|directions|prompts)/i,
    /disregard (all )?(previous|prior) (instructions|rules)/i,
    /you are now in (developer|dan|jailbreak|unrestricted) mode/i,
    /system prompt override/i,
    /turn off (citation|guardrail|safety) requirements/i,
    /email the (prosecutor|court|judge) directly/i,
    /file this (document|motion) (automatically|for me|now)/i,
    /who is the best attorney/i,
    /recommend (me )?an attorney/i,
  ];

  return patterns.some((p) => p.test(input));
}

/**
 * Generates grounded fallback content when offline or when API key is unconfigured.
 * Features tailored contextual responses across 10 distinct legal domains to avoid canned repetitions.
 */
interface CaseContextData {
  caseTitle?: string;
  caseNumber?: string;
  courtName?: string;
  judge?: string;
  prosecutor?: string;
  jurisdiction?: string;
  matterId?: string;
  chargeCount?: number;
  evidenceCount?: number;
  charges?: Array<{ count?: number; title?: string; statute?: string; tier?: string; summary?: string }>;
  evidence?: Array<{ title?: string; type?: string; status?: string }>;
  deadlines?: Array<{ title?: string; dueDate?: string; daysRemaining?: number }>;
}

type MatterDomain = "paternity_family" | "criminal" | "civil";

function analyzeMatterType(caseNumber?: string, caseTitle?: string, chargeCount?: number): { domain: MatterDomain; countyName?: string; courtType?: string; subType?: string } {
  const num = (caseNumber || "").toUpperCase();
  const title = (caseTitle || "").toLowerCase();

  let countyName: string | undefined;
  let courtType: string | undefined;

  // Indiana trial court case format: [CountyNumber][CourtType]-[YYMM]-[CaseType]-[Sequence]
  // e.g. 73C01-2205-JP-000025: 73 = Shelby County, C01 = Circuit Court 1, JP = Juvenile Paternity
  if (/^73[A-Z0-9]/.test(num)) countyName = "Shelby County";
  else if (/^49[A-Z0-9]/.test(num)) countyName = "Marion County";
  else if (/^02[A-Z0-9]/.test(num)) countyName = "Allen County";
  else if (/^45[A-Z0-9]/.test(num)) countyName = "Lake County";
  else if (/^53[A-Z0-9]/.test(num)) countyName = "Monroe County";
  else if (/^71[A-Z0-9]/.test(num)) countyName = "St. Joseph County";
  else if (/^79[A-Z0-9]/.test(num)) countyName = "Tippecanoe County";
  else if (/^82[A-Z0-9]/.test(num)) countyName = "Vanderburgh County";

  if (num.includes("C01") || num.includes("C02")) courtType = "Circuit Court";
  else if (num.includes("D01") || num.includes("D02") || num.includes("D03")) courtType = "Superior Court";

  if (
    num.includes("-JP-") ||
    num.includes("-JC-") ||
    num.includes("-DR-") ||
    num.includes("-DC-") ||
    num.includes("-DN-") ||
    title.includes("paternity") ||
    title.includes("custody") ||
    title.includes("parenting") ||
    title.includes("child support")
  ) {
    const subType = num.includes("-JP-") ? "Juvenile Paternity (JP)" : num.includes("-DC-") ? "Domestic Relations with Children (DC)" : "Family & Domestic Relations";
    return { domain: "paternity_family", countyName, courtType, subType };
  }

  if (
    num.includes("-CM-") ||
    num.includes("-CF-") ||
    num.includes("-F1-") ||
    num.includes("-F2-") ||
    num.includes("-F3-") ||
    num.includes("-F4-") ||
    num.includes("-F5-") ||
    num.includes("-F6-") ||
    num.includes("-MR-") ||
    num.includes("-MC-") ||
    (chargeCount && chargeCount > 0)
  ) {
    return { domain: "criminal", countyName, courtType, subType: "Criminal Defense" };
  }

  return { domain: "civil", countyName, courtType, subType: "Civil Proceeding" };
}

/**
 * Generates grounded, contextual legal intelligence across criminal, family, and civil domains.
 * Adapts to specific case numbers (e.g. Indiana Juvenile Paternity 73C01-2205-JP-000025)
 * and maintains conversational continuity without repeating boilerplates.
 */
function generateGroundedFallback(
  input: string,
  jurisdiction: string,
  agentRole: string,
  caseTitle?: string,
  caseNumber?: string,
  history?: Array<{ sender: string; text: string }>,
  context?: CaseContextData
): { text: string; citations: string[] } {
  const lower = input.toLowerCase().trim();
  const matterRef = caseNumber ? `Case Ref: ${caseNumber}` : "Self-Represented Case File";
  const caseHeader = `${caseTitle || "Pro Se Litigant Workspace"} (${matterRef} · ${jurisdiction})`;
  const chargeCount = context?.chargeCount ?? 0;
  const analysis = analyzeMatterType(caseNumber, caseTitle, chargeCount);
  const isFamily = analysis.domain === "paternity_family";
  const isCriminal = analysis.domain === "criminal";
  const locationDesc = analysis.countyName ? `${analysis.countyName} ${analysis.courtType || "Court"}` : `${jurisdiction} Court`;

  // 1. Clarification & Follow-Up ("what", "what?", "huh", "why", "i don't understand", "clarify")
  if (
    lower === "what" ||
    lower === "what?" ||
    lower === "huh" ||
    lower === "huh?" ||
    lower === "why" ||
    lower === "why?" ||
    lower === "what do you mean" ||
    lower === "i don't understand" ||
    lower.includes("don't understand") ||
    lower.includes("can you explain")
  ) {
    if (isFamily) {
      return {
        text: `${MANDATORY_HEADER}### Direct Plain-English Summary: ${caseHeader}

Here is what you need to know in simple terms for this matter in ${locationDesc}:

- **Case Classification:** This is a **Juvenile Paternity / Family** proceeding (${analysis.subType || "JP"}), not a criminal prosecution. There are no criminal charges or arrests involved.
- **What Is Happening:** Either you or the other parent has filed a petition regarding paternity, child custody, parenting time (visitation), or child support. The court's primary mandate is the child's best interests under Indiana Code § 31-14-13-2.

**Your Immediate 3-Step Checklist Right Now:**
1. **Check Your Court Date:** Look up case **${caseNumber || "your case"}** on the public Indiana court portal (**mycase.in.gov**). Is there an active hearing or pre-trial conference scheduled?
2. **Review Recent Filings:** Have you received a petition (e.g., Petition to Establish Paternity or Modify Custody) that requires a written response within 20–23 days under Indiana Trial Rule 6?
3. **Save Communications:** Log text messages, parenting time exchanges, and financial receipts in your Evidence Locker.

Would you like help preparing for a scheduled hearing, or drafting a response to a petition?${MANDATORY_FOOTER}`,
        citations: [
          "Ind. Code § 31-14-13-2 (Best Interests of Child Standard)",
          "Ind. Trial Rule 3.1 (Appearance of Pro Se Litigant)",
          "Indiana Parenting Time Guidelines (IPTG)",
          "mycase.in.gov (Indiana Judicial Branch Portal)",
        ],
      };
    }

    return {
      text: `${MANDATORY_HEADER}### Plain-English Case Clarification: ${caseHeader}

To answer your question directly: as **${agentRole}**, I help you organize and prepare your legal defense step by step.

Here is the straightforward breakdown:
1. **Factual Evidence:** Gather all objective proof (dispatch CAD logs, video recordings, receipts, and witness statements) to dispute any inaccurate statements in the official reports.
2. **Procedural Rules:** Hold the opposing party strictly to court rules and constitutional protections (e.g. proof beyond a reasonable doubt, timely discovery disclosure).
3. **Next Move:** Decide whether your priority today is reviewing charges, requesting discovery, or preparing for an upcoming court hearing.

Tell me: which of these would you like to focus on first?${MANDATORY_FOOTER}`,
      citations: [
        "Faretta v. California, 422 U.S. 806 (1975)",
        "In re Winship, 397 U.S. 358 (1970)",
        `Rules of Procedure for ${jurisdiction}`,
      ],
    };
  }

  // 2. Actionable Roadmap ("what should i do", "what do i do", "where do i start", "next steps")
  if (
    lower.includes("what should i do") ||
    lower.includes("what do i do") ||
    lower.includes("next step") ||
    lower.includes("where do i start") ||
    lower.includes("how do i proceed") ||
    lower.includes("help me start") ||
    lower.includes("what now")
  ) {
    if (isFamily) {
      return {
        text: `${MANDATORY_HEADER}### Procedural Roadmap: ${caseHeader}
**Jurisdiction:** ${locationDesc} | **Matter Type:** ${analysis.subType || "Juvenile Paternity"}

Because you are representing yourself (*pro se*) in this Indiana family/paternity matter, here is your prioritized action plan:

1. **Step 1 — Verify the Public Docket on Indiana MyCase:**
   - Search your case number (**${caseNumber || "your case"}**) on **mycase.in.gov**.
   - Confirm whether any upcoming hearing, case management conference, or mediation session is scheduled.
   - Note the exact title of the most recent petition or motion filed by the opposing party.

2. **Step 2 — File a Pro Se Appearance Form (Ind. Trial Rule 3.1):**
   - Ensure the clerk has your current physical mailing address, phone number, and email on file.
   - Filing an Appearance ensures you receive all court notices, orders, and opposing filings immediately.

3. **Step 3 — Review the Indiana Parenting Time Guidelines (IPTG):**
   - Under Indiana statutory policy (Ind. Code § 31-14-14-1), the Indiana Parenting Time Guidelines serve as the presumptive minimum standard for parenting time.
   - If parenting time or custody is in dispute, document all requested and exercised time.

4. **Step 4 — Calculate Response Deadlines (Ind. Trial Rule 6):**
   - In Indiana civil practice, a written response to a petition or motion is typically due within **20 days** of personal service (or **23 days** if served by mail).
   - If served with discovery requests (Interrogatories or Requests for Production), responses are due within 30 days under Ind. Trial Rules 33 and 34.

5. **Step 5 — Populate Your Evidence Locker:**
   - Upload text messages, emails, child-related expense receipts, and existing court orders into this workspace so we can organize your chronology.

Would you like to start by reviewing an upcoming hearing date, or drafting an Appearance / Response?${MANDATORY_FOOTER}`,
        citations: [
          "Ind. Code § 31-14 (Family Law — Paternity)",
          "Ind. Trial Rule 3.1 (Appearance)",
          "Ind. Trial Rule 6 (Time Computation & Service Windows)",
          "Indiana Parenting Time Guidelines (Rule-Based Standard)",
          "mycase.in.gov (Indiana Odyssey Case Portal)",
        ],
      };
    }

    if (isCriminal) {
      return {
        text: `${MANDATORY_HEADER}### Strategic Pro Se Action Roadmap: ${caseHeader}

As **${agentRole}**, here is your structured procedural priority plan for this criminal defense matter:

1. **Phase 1 — Secure Official Docket & Charging Instrument:**
   - Obtain a certified copy of the Information or Indictment and the Probable Cause Affidavit from the court clerk.
   - Note your statutory speedy trial window and the date of your upcoming Omnibus or Pre-Trial Conference.

2. **Phase 2 — Serve a Formal Written Discovery Demand:**
   - Under *Brady v. Maryland*, 373 U.S. 83 (1963) and state criminal discovery rules, demand all exculpatory evidence, raw body-worn camera (BWC) footage, and CAD dispatch logs.
   - Serve this demand on the prosecutor and file proof of service with the clerk.

3. **Phase 3 — Construct Timeline & Contradiction Matrix:**
   - Cross-reference timestamps in police reports against objective physical records and video footage.
   - Flag every factual inconsistency in your Timeline module.

4. **Phase 4 — Pre-Trial Motions:**
   - If the initial stop lacked reasonable suspicion, prepare a **Motion to Suppress Evidence** under *Terry v. Ohio* prior to the Omnibus deadline.

Would you like to draft a formal discovery request or analyze the statutory elements of your charges?${MANDATORY_FOOTER}`,
        citations: [
          "Brady v. Maryland, 373 U.S. 83 (1963)",
          "Faretta v. California, 422 U.S. 806 (1975)",
          "Terry v. Ohio, 392 U.S. 1 (1968)",
          `Rules of Criminal Procedure for ${jurisdiction}`,
        ],
      };
    }

    return {
      text: `${MANDATORY_HEADER}### Procedural Roadmap: ${caseHeader}
**Court:** ${locationDesc}

For this self-represented matter, follow this standard procedural roadmap:
1. **Confirm Appearance & Service:** Verify your Appearance is active under Trial Rule 3.1 so you receive official court notices.
2. **Review Response Deadlines:** Calculate your statutory filing windows under Trial Rule 6 (typically 20 days for responses).
3. **Assemble Supporting Exhibits:** Collect and index all relevant written agreements, notices, receipts, and correspondence.
4. **Prepare for Pre-Trial Conference:** Outline your key factual points and legal authorities.

Tell me what specific issue or document you are working on today.${MANDATORY_FOOTER}`,
      citations: [
        "Ind. Trial Rule 3.1 (Appearance)",
        "Ind. Trial Rule 6 (Time Computation)",
        "Faretta v. California, 422 U.S. 806 (1975)",
      ],
    };
  }

  // 3. Courtroom Demeanor, Hearings, and Bench Etiquette
  if (
    lower.includes("court") ||
    lower.includes("judge") ||
    lower.includes("hearing") ||
    lower.includes("bench") ||
    lower.includes("dress") ||
    lower.includes("attire") ||
    lower.includes("address") ||
    agentRole.includes("Court Preparation")
  ) {
    return {
      text: `${MANDATORY_HEADER}### Courtroom Logistics, Demeanor & Hearing Preparation Guide\n\nFor hearings in ${locationDesc} (${caseHeader}):\n\n1. **Addressing the Presiding Judge:**\n   - Always stand when the judge enters the courtroom or whenever addressing the bench.\n   - Address the judge exclusively as *'Your Honor'*.\n   - Never speak over or interrupt the judge or opposing party. Wait until they finish, then state: *'May I respond, Your Honor?'*\n\n2. **Physical Documents & Exhibits:**\n   - Bring at least three (3) clean printed copies of every motion, financial worksheet, or exhibit: one for the judge, one for the other side, and one for yourself.\n   - Pre-label all exhibits clearly (Exhibit A, B, C).\n\n3. **Decorum & Speaking Order:**\n   - Speak in a calm, measured tone directly into the courtroom microphone for the official record.\n   ${isFamily ? "- Keep your arguments strictly focused on the child's best interests under Indiana Code § 31-14-13-2 rather than personal grievances." : "- Stick strictly to verifiable facts, constitutional rules, and indexed exhibits."}\n\n4. **Arrival & Check-In:**\n   - Arrive at the courthouse 30 minutes early to clear security and check in with the court bailiff.${MANDATORY_FOOTER}`,
      citations: [
        `Local Rules of Court for ${jurisdiction}`,
        "Ind. Code § 31-14-13-2 (Best Interests of Child)",
        "Standards of Judicial Decorum",
        "Faretta v. California, 422 U.S. 806 (1975)",
      ],
    };
  }

  // 4. Deadlines, Computation of Time & Calendars
  if (
    lower.includes("deadline") ||
    lower.includes("speedy") ||
    lower.includes("time") ||
    lower.includes("calendar") ||
    lower.includes("clock") ||
    lower.includes("how long")
  ) {
    return {
      text: `${MANDATORY_HEADER}### Court Deadlines & Procedural Clock Computation\n\nCase Ref: ${matterRef} · ${locationDesc}\n\n1. **Rule of Time Computation (Ind. Trial Rule 6(A)):**\n   - The day of the act or event triggering the period is excluded.\n   - The last day of the period is included, unless it falls on a Saturday, Sunday, or legal state holiday, in which case the deadline extends to the next business day.\n\n2. **Response Deadlines:**\n   - **Written Motions & Petitions:** Generally 20 days from personal service, or 23 days if served by U.S. Mail (Ind. Trial Rule 6(E) 3-day mail extension).\n   - **Discovery Demands:** 30 days from date of service under Ind. Trial Rules 33 and 34.\n\n3. **Omnibus & Pre-Trial Dates:**\n   - Substantive motions must be filed before the court's scheduling order cut-off date.\n   ${isCriminal ? "- In criminal cases, speedy trial demands operate under Indiana Criminal Rule 4 (70-day window for defendants held in custody)." : "- Review the court's case management order on mycase.in.gov for all scheduled deadlines."}${MANDATORY_FOOTER}`,
      citations: [
        "Ind. Trial Rule 6 (Computation of Time)",
        "Ind. Trial Rule 33 & 34 (Discovery Windows)",
        "Ind. R. Crim. P. 4 (Speedy Trial Standard)",
      ],
    };
  }

  // 5. Custody, Parenting Time & Child Support (Family specific)
  if (
    lower.includes("custody") ||
    lower.includes("parenting") ||
    lower.includes("visitation") ||
    lower.includes("support") ||
    lower.includes("paternity")
  ) {
    return {
      text: `${MANDATORY_HEADER}### Child Custody, Parenting Time & Support Analysis: ${caseHeader}\n\nUnder Indiana family law governing paternity and domestic matters:\n\n1. **Legal Custody vs. Physical Custody (Ind. Code § 31-14-13):**\n   - **Legal Custody:** Authority to make major decisions regarding schooling, healthcare, and religion.\n   - **Physical Custody:** Where the child primarily resides.\n   - The court determines custody based on the child's best interests, evaluating factors such as parent-child interaction, child adjustment, and parental mental/physical health.\n\n2. **Indiana Parenting Time Guidelines (IPTG):**\n   - Under Ind. Code § 31-14-14-1, the IPTG establishes the presumptive minimum time a non-custodial parent should exercise with the child.\n   - Departures from these guidelines require specific written findings that regular parenting time would endanger the child's physical health or impair emotional development.\n\n3. **Child Support Calculations:**\n   - Indiana uses the Income Shares Model. Support is calculated using the official Child Support Obligation Worksheet based on weekly gross income, work-related childcare, health insurance, and overnight parenting time credits (Guideline 6).\n\nWould you like help calculating parenting time credits or preparing a custody position outline?${MANDATORY_FOOTER}`,
      citations: [
        "Ind. Code § 31-14-13-2 (Child Custody Factors)",
        "Ind. Code § 31-14-14-1 (Parenting Time Rights)",
        "Indiana Parenting Time Guidelines (IPTG)",
        "Indiana Child Support Rules and Guidelines",
      ],
    };
  }

  // 6. Evidence, Exhibits & Authenticity
  if (
    lower.includes("evidence") ||
    lower.includes("document") ||
    lower.includes("text") ||
    lower.includes("photo") ||
    lower.includes("video") ||
    lower.includes("witness") ||
    lower.includes("exhibit") ||
    agentRole.includes("Evidence Organizer")
  ) {
    return {
      text: `${MANDATORY_HEADER}### Evidence Preservation & Exhibit Admissibility Checklist\n\nFor case exhibits in ${locationDesc}:\n\n1. **Authentication Requirement (Ind. Rule of Evidence 901):**\n   - To introduce evidence (texts, photos, emails, call logs), you must demonstrate that the item is what it claims to be.\n   - For text messages: preserve complete screenshot chains showing date, time, and sender phone number or account identifier.\n\n2. **Hearsay Rules & Exceptions (Ind. Rule of Evidence 801-803):**\n   - Out-of-court statements offered to prove the truth of the matter are hearsay.\n   - Opposing party statements are admissible as non-hearsay (Rule 801(d)(2)). Business records kept in the regular course of business are admissible with proper certification (Rule 803(6)).\n\n3. **Evidence Locker Best Practices:**\n   - Assign each proof item an exhibit label (Exhibit A, B, C).\n   - Correlate each exhibit to a specific factual claim or timeline event in this workspace.${MANDATORY_FOOTER}`,
      citations: [
        "Ind. R. Evid. 901 (Authenticating or Identifying Evidence)",
        "Ind. R. Evid. 801 & 803 (Hearsay & Exceptions)",
        "Ind. R. Evid. 1002 (Requirement of an Original)",
      ],
    };
  }

  // 7. Adaptive Default Response
  return {
    text: `${MANDATORY_HEADER}### Procedural Analysis: ${caseHeader}

Regarding your inquiry: *"user question: ${input.replace(/[\n\r]+/g, " ")}"*

1. **Procedural Assessment:**
   As **${agentRole}**, I analyze matters within ${jurisdiction} procedural rules. Self-represented litigants are held to the same court rules as licensed attorneys under *Faretta v. California*.

2. **Core Action Items for This Matter:**
   - **Check Controlling Court Rules:** Verify the specific Indiana Trial Rules or local rules governing this proceeding.
   - **Put Actions in Writing:** Submit all formal requests as signed, dated written motions with certificates of service (Ind. Trial Rule 5).
   - **Index Your Proof:** Log all relevant records into your Evidence Locker.

${isFamily ? "You can review parenting time guidelines, calculate deadlines, or draft court responses directly in this workspace." : "You can draft pre-trial motions in Draft Desk, simulate hearing procedure in the 3D War Room, or research case law in the Legal Library."}

How would you like to proceed?${MANDATORY_FOOTER}`,
    citations: [
      "Faretta v. California, 422 U.S. 806 (1975)",
      `Indiana Rules of Trial Procedure`,
      "Ind. Trial Rule 5 (Service and Filing of Pleadings)",
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      message = "",
      jurisdiction = "Indiana",
      agentRole = "Head Legal AI",
      context = {},
      conversationHistory = [],
    } = body;

    // Security Gate 1: Check for prompt injection
    if (detectPromptInjection(message)) {
      return NextResponse.json(
        {
          error: "Prompt policy violation: instruction injection or prohibited external action detected.",
          text: `${MANDATORY_HEADER}### Security Notice\n\nThis request was flagged because it attempted to override system instructions, alter guardrails, recommend specific counsel, or request autonomous external court action. Chain of Command functions strictly as an informational workspace where external actions remain human-controlled.${MANDATORY_FOOTER}`,
          citations: ["[Guardrail Enforced - Instruction Injection Prevented]"],
          runId: `run-sec-${Date.now()}`,
          verified: false,
          grounding: { status: "ungrounded", note: "Safety filter triggered" },
        },
        { status: 400 }
      );
    }

    let generatedText = "";
    let citations: string[] = [];
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const isRealApiKey = Boolean(apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim().length > 10);

    if (isRealApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: apiKey! });
        const historyContext = Array.isArray(conversationHistory) && conversationHistory.length > 0
          ? "\n\nRecent Chat History:\n" + conversationHistory.slice(-6).map((h: { sender?: string; text?: string }) => `${h.sender === "user" ? "Litigant" : agentRole}: ${h.text}`).join("\n")
          : "";

        const systemPrompt = `You are ${agentRole}, a specialized legal AI in the Chain of Command legal operating system for self-represented (pro se) litigants.
Jurisdiction: ${jurisdiction}
Case Context: ${context.caseTitle || "Self-Represented Matter"} (${context.caseNumber || "Pro Se"}) in ${context.courtName || "Court"}.
Matter Charges: ${JSON.stringify(context.charges || [])}
Matter Evidence: ${JSON.stringify(context.evidence || [])}
Matter Deadlines: ${JSON.stringify(context.deadlines || [])}
${historyContext}

STRICT MANDATORY RULES (CHAIN OF COMMAND ARCHITECTURE):
1. NO AUTONOMOUS FILING OR ACTION: Never claim to file, sign, submit, or contact court personnel or opposing parties.
2. ZERO STATUTE HALLUCINATIONS: Every legal rule, code section, or procedure must cite an active statutory authority, court rule, or binding precedent (e.g. Ind. Code § 31-14 or Ind. Trial Rule 3.1). If unverified, state '[Authority Not Verified - Consult Local Rules or Counsel]'.
3. FORBIDDEN PHRASE: You must NEVER include the phrase "In my legal opinion".
4. TONE: Direct, empathetic, objective, plain English (8th-grade level). Answer the user's specific inquiry directly. If the user asks a clarification like "what", explain the immediate next practical step simply.
5. PREPEND output with exactly:
[PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW]
6. APPEND output with exactly:
This information is provided for educational and procedural purposes only and does not constitute legal advice. No attorney-client relationship is formed. Consult a licensed attorney for case-specific representation.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `${systemPrompt}\n\nUser Question/Inquiry: "${message}"`,
        });

        if (response && response.text) {
          generatedText = response.text;
        }
      } catch (geminiError) {
        console.warn("[Gemini API Gateway] Notice, falling back to grounded synthesis:", geminiError);
      }
    }

    // Prefer local Ollama when Gemini is unavailable (project primary LLM)
    let usedLiveModel = Boolean(generatedText);
    if (!generatedText) {
      const ollamaBase = (process.env.OLLAMA_URL || process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/+$/, "");
      const ollamaModel = process.env.OLLAMA_MODEL || process.env.YHWH_MODEL || "llama3.2";
      try {
        const ollamaRes = await fetch(`${ollamaBase}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: ollamaModel,
            stream: false,
            messages: [
              {
                role: "system",
                content: `You are ${agentRole} in Chain of Command, an educational pro se legal workspace. Jurisdiction: ${jurisdiction}. Case: ${context.caseTitle || "n/a"} (${context.caseNumber || "n/a"}). Rules: never claim to file or contact courts; never say "In my legal opinion"; cite sources when stating law; if unsure say so; educational only not legal advice; 8th-grade reading level.`,
              },
              { role: "user", content: String(message) },
            ],
          }),
        });
        if (ollamaRes.ok) {
          const odata = await ollamaRes.json();
          const content = odata?.message?.content;
          if (typeof content === "string" && content.trim()) {
            generatedText = content.trim();
            usedLiveModel = true;
          }
        }
      } catch (ollamaErr) {
        console.warn("[Ollama] unavailable:", ollamaErr);
      }
    }

    // Template fallback only if no live model answered
    let usedTemplateFallback = false;
    if (!generatedText) {
      const fallback = generateGroundedFallback(
        message,
        jurisdiction,
        agentRole,
        context.caseTitle,
        context.caseNumber,
        conversationHistory,
        context
      );
      generatedText = fallback.text;
      citations = fallback.citations;
      usedTemplateFallback = true;
    }

    // Security Gate 2: Enforce Mandatory Blocklist Phrase
    generatedText = generatedText.replace(/In my legal opinion/gi, "From a procedural analysis perspective");

    // Security Gate 3: Guarantee Mandatory Header and Footer
    if (!generatedText.includes("[PREPARED FOR SELF-REPRESENTED LITIGANT")) {
      generatedText = `${MANDATORY_HEADER}${generatedText}`;
    }
    if (!generatedText.includes("does not constitute legal advice")) {
      generatedText = `${generatedText}${MANDATORY_FOOTER}`;
    }

    // Extract citations if not already provided
    if (citations.length === 0) {
      const citationRegex = /([A-Z][a-zA-Z\s.]+v\.\s+[A-Z][a-zA-Z\s.]+(?:,\s+\d+\s+U\.S\.\s+\d+)?|[A-Z][a-z]+(?:\.\s+[A-Z][a-z]+)*\s+Code\s+§\s*[\d-]+(?:\([\w\d]+\))*|U\.S\.\s+Const\.\s+[a-z.]+(?:\s+[IVX]+)?)/g;
      const matches = generatedText.match(citationRegex);
      if (matches) {
        citations = Array.from(new Set(matches)).slice(0, 5);
      }
      if (citations.length === 0) {
        citations = [`Statutes of ${jurisdiction}`, "Local Court Rules of Criminal Procedure"];
      }
    }

    const claimBundle = claimsFromCitationStrings(generatedText, citations, {
      jurisdiction,
      generationMethod: usedTemplateFallback ? "template" : usedLiveModel ? "model" : "template",
    });

    return NextResponse.json({
      success: true,
      text: generatedText,
      citations,
      /** Claim-level source verification (docs/SOURCE_VERIFICATION_PROTOCOL.md) */
      claims: claimBundle.claims,
      claimBundle: {
        verificationStatus: claimBundle.verificationStatus,
        generationMethod: claimBundle.generationMethod,
        lastVerifiedAt: claimBundle.lastVerifiedAt ?? null,
      },
      agentRole,
      runId: `run-${Date.now()}`,
      verified: usedLiveModel && !usedTemplateFallback,
      labeling: "Information",
      grounding: {
        status: usedTemplateFallback ? "template_fallback" : usedLiveModel ? "model" : "ungrounded",
        jurisdiction,
        citationsCount: citations.length,
        note: usedTemplateFallback
          ? "No live model available; educational template only — verify all citations."
          : "Citations mapped to ClaimObject sources; not yet re-fetched against primary corpus.",
      },
      disclaimer: "This information is provided for educational and procedural purposes only and does not constitute legal advice.",
      humanReviewRequired: true,
    });
  } catch (error) {
    console.error("[AI Lawyer Route Error]:", error);
    return NextResponse.json(
      {
        error: "Internal error processing legal intelligence inquiry",
        text: `${MANDATORY_HEADER}The system encountered a temporary error connecting to the model gateway. Please review your offline case documents or consult local court clerk resources.${MANDATORY_FOOTER}`,
        citations: ["[Authority Not Verified - Consult Local Rules or Counsel]"],
      },
      { status: 500 }
    );
  }
}
