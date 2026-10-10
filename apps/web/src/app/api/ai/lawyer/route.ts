import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

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
 * Generates grounded fallback content when offline or when API key is unconfigured
 */
function generateGroundedFallback(
  input: string,
  jurisdiction: string,
  agentRole: string,
  caseTitle?: string,
  caseNumber?: string
): { text: string; citations: string[] } {
  const lower = input.toLowerCase();

  if (lower.includes("charge") || lower.includes("element") || agentRole.includes("Charge Explainer")) {
    return {
      text: `${MANDATORY_HEADER}### Statutory Element Breakdown: Alleged Criminal Offense\n\n1. **Actus Reus (The Alleged Conduct):**\n   Under the statutory penal code of ${jurisdiction}, the prosecution carries the affirmative burden to prove each factual allegation beyond a reasonable doubt.\n\n2. **Mens Rea (Required State of Mind):**\n   The State must establish knowing, intentional, or reckless conduct depending on the charged statutory degree. Accidental or justified actions negate criminal intent.\n\n3. **Affirmative Defenses & Justification:**\n   Under statutory self-defense doctrine (e.g. Ind. Code § 35-41-3-2 / Cal. Penal Code § 198.5), upon a prima facie showing of justified defensive force, the State bears the non-shifting burden of disproving justification beyond a reasonable doubt.\n\n4. **Statutory Penalties & Collateral Consequences:**\n   Maximum statutory penalties vary by severity tier. Self-represented litigants should review potential license suspensions, civil disability, or immigration consequences.${MANDATORY_FOOTER}`,
      citations: [`${jurisdiction} Penal Code General Provisions`, "Ind. Code § 35-41-3-2", "In re Winship, 397 U.S. 358 (1970)"],
    };
  }

  if (lower.includes("search") || lower.includes("4th") || lower.includes("suppress") || agentRole.includes("Rights Checker")) {
    return {
      text: `${MANDATORY_HEADER}### Fourth Amendment Search & Seizure Analysis\n\n1. **Standard under Terry v. Ohio, 392 U.S. 1 (1968):**\n   An investigatory stop requires reasonable, articulable suspicion supported by specific objective facts. A stop extended beyond the original mission without independent justification violates the Fourth Amendment (Rodriguez v. United States, 575 U.S. 348).\n\n2. **Warrantless Searches & Exceptions:**\n   Warrantless searches are per se unreasonable unless falling within a recognized exception (consent, plain view, automobile exception with demonstrable probable cause, search incident to lawful arrest).\n\n3. **Procedural Next Step:**\n   Prepare a formal Pro Se Motion to Suppress Evidence citing the Exclusionary Rule (Mapp v. Ohio, 367 U.S. 643) prior to the omnibus motion deadline.${MANDATORY_FOOTER}`,
      citations: ["Terry v. Ohio, 392 U.S. 1 (1968)", "Mapp v. Ohio, 367 U.S. 643 (1961)", "Rodriguez v. United States, 575 U.S. 348 (2015)", "U.S. Const. amend. IV"],
    };
  }

  if (lower.includes("brady") || lower.includes("discovery") || lower.includes("video") || agentRole.includes("Paralegal")) {
    return {
      text: `${MANDATORY_HEADER}### Exculpatory Evidence & Discovery Demand Checklist\n\nUnder Brady v. Maryland, 373 U.S. 83 (1963) and local court discovery orders, the prosecution must disclose all evidence favorable to the defense:\n\n- [x] Complete, unedited body-worn camera (BWC) and dashcam footage.\n- [x] Computer Aided Dispatch (CAD) logs and 911 audio recordings.\n- [x] Giglio impeachment material regarding arresting officers' disciplinary history.\n- [x] Merchant surveillance tapes and point-of-sale register records.\n- [x] Contact information for all civilian witnesses identified during investigation.\n\nServe this formal written demand upon the Office of the Prosecuting Attorney according to local criminal discovery rules.${MANDATORY_FOOTER}`,
      citations: ["Brady v. Maryland, 373 U.S. 83 (1963)", "Giglio v. United States, 405 U.S. 150 (1972)", "Local Court Rules of Criminal Procedure"],
    };
  }

  return {
    text: `${MANDATORY_HEADER}### Procedural Case Guidance: ${caseTitle || "Pro Se Case Workspace"}\n\nCase Ref: ${caseNumber || "Pro Se Record"} | Jurisdiction: ${jurisdiction}\n\n1. **Factual Integrity & Timeline Correlation:**\n   Review all charging affidavits and cross-reference officer narrative timestamps against dispatch recordings and physical exhibits.\n\n2. **Courtroom Etiquette & Addressing the Bench:**\n   Always address the presiding judge as 'Your Honor'. Arrive 30 minutes early, bring three (3) copies of any motion or exhibit, and speak clearly into the courtroom microphone.\n\n3. **Self-Representation Rights:**\n   The right to represent oneself is constitutionally grounded under Faretta v. California, 422 U.S. 806 (1975). Pro se litigants are held to the same substantive procedural rules as licensed counsel.${MANDATORY_FOOTER}`,
    citations: ["Faretta v. California, 422 U.S. 806 (1975)", `Rules of Criminal Procedure for ${jurisdiction}`, "U.S. Const. amend. VI & XIV"],
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
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `You are a specialist legal AI agent in the Chain of Command legal operating system for self-represented (pro se) litigants.
Current Specialist Role: ${agentRole}
Jurisdiction: ${jurisdiction}
Case Context: ${context.caseTitle || "Self-Represented Matter"} (${context.caseNumber || "Pro Se"}) in ${context.courtName || "Superior Court"}.

STRICT MANDATORY RULES (GEMINI.md & CHAIN OF COMMAND ARCHITECTURE):
1. NO AUTONOMOUS FILING OR ACTION: Never claim to file, sign, submit, or contact court personnel or opposing parties.
2. ZERO STATUTE HALLUCINATIONS: Every legal rule, code section, or procedure must cite an active statutory authority, court rule, or binding appellate precedent (e.g. Ind. Code § 35-41-3-2 or Terry v. Ohio, 392 U.S. 1). If a citation cannot be verified, state '[Authority Not Verified - Consult Local Rules or Counsel]'.
3. FORBIDDEN PHRASE: You must NEVER include the phrase "In my legal opinion".
4. TONE: Objective, calm, highly structured, 8th-grade reading level.
5. PREPEND output with exactly:
[PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW]
6. APPEND output with exactly:
This information is provided for educational and procedural purposes only and does not constitute legal advice. No attorney-client relationship is formed. Consult a licensed attorney for case-specific representation.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `${systemPrompt}\n\nUser Question/Inquiry: "${message}"`,
        });

        if (response && response.text) {
          generatedText = response.text;
        }
      } catch (geminiError) {
        console.warn("[Gemini API Gateway] Runtime notice, falling back to grounded synthesis:", geminiError);
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
        context.caseNumber
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

    return NextResponse.json({
      success: true,
      text: generatedText,
      citations,
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
          : undefined,
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
