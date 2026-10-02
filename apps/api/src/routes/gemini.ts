import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { LegalInfoResponseSchema } from '../types/legalResponse';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { detectPromptInjection } from '../ai/runtime';

export const geminiRouter = Router();

// Server-side only system prompt - NEVER accept client-controlled system instructions
export const UPL_SYSTEM_PROMPT = `You are a legal document assistant and educational information system.
You are strictly prohibited from providing legal advice or engaging in the Unauthorized Practice of Law (UPL).

STRICT OPERATIONAL RULES:

1. INFORMATIONAL ONLY:
   Provide statutory quotes, procedural deadlines, definitions, and blank template structures. Do not customize legal strategy for specific outcomes.

2. NO STRATEGY OR OUTCOME PREDICTION:
   Never advise the user on whether to sue, settle, plead, or waive rights. Never calculate win probabilities, assess case strength, or predict judge/jury decisions.

3. FACT TRANSCRIPTION:
   Format and organize factual inputs supplied explicitly by the user. Do not invent legal arguments, claims, or unstated facts.

4. CITATION GROUNDING:
   Every procedural rule or statutory explanation must cite the specific state code or court rule. If the jurisdiction is unknown, demand jurisdiction before answering.

5. DISCLAIMER ATTACHMENT:
   Prepend all generated document drafts with:
   "[PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW]"`;

const DEFAULT_MODEL = 'gemini-3.1-flash-lite';
const MODEL_FALLBACK_CHAIN = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

// Helper to sanitize user input - treat as untrusted data
function sanitizeUserInput(input: string): string {
  if (!input) return '';
  
  if (detectPromptInjection(input)) {
    throw new Error('Invalid input - prompt injection detected');
  }
  
  return String(input);
}

// Helper to create safe user message
function createUserMessage(text: string): { role: 'user'; parts: { text: string }[] } {
  const sanitized = sanitizeUserInput(text);
  return { role: 'user', parts: [{ text: sanitized }] };
}

// Generic error message to avoid leaking internal details
const GENERIC_ERROR_MESSAGE = 'AI request failed';

function getAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is missing');
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export async function generateContentWithFallback(
  client: GoogleGenAI,
  preferredModel: string | undefined,
  params: {
    contents: any;
    config?: any;
  }
): Promise<{ response: any; modelUsed: string }> {
  const primary = preferredModel || DEFAULT_MODEL;
  const candidateModels = [primary, ...MODEL_FALLBACK_CHAIN.filter((m) => m !== primary)];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return { response, modelUsed: model };
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Fallback] Model "${model}" failed. Trying fallback model...`);
    }
  }

  throw lastError || new Error("All Gemini model fallbacks failed");
}

geminiRouter.post('/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { history = [], prompt, modelName, useSearch, useHighThinking } = req.body;
    
    // REJECT client-controlled system instructions - server-side only
    if (req.body.systemInstruction) {
      console.warn('Gemini chat: Client attempted to override system instruction - rejected');
      return res.status(400).json({ error: "System instructions are server-controlled only" });
    }
    
    const client = getAI();
    let model = modelName || DEFAULT_MODEL;
    let config: any = {};

    // Server-side system instruction ONLY - never client-controlled
    config.systemInstruction = UPL_SYSTEM_PROMPT;
    if (useSearch) config.tools = [{ googleSearch: {} }];

    if (useHighThinking) {
      model = 'gemini-3.1-pro-preview';
    }

    // Build safe user messages - user content is untrusted data
    const userPrompt = sanitizeUserInput(prompt || '');
    const safeHistory = history.map((h: any) => {
      if (typeof h === 'string') {
        return createUserMessage(h);
      }
      if (h && h.role === 'user' && Array.isArray(h.parts)) {
        return {
          role: 'user',
          parts: h.parts.map((p: any) => createUserMessage(p.text || '').parts[0]),
        };
      }
      return h;
    });

    const { response, modelUsed } = await generateContentWithFallback(client, model, {
      contents: [...safeHistory, createUserMessage(userPrompt)],
      config,
    });

    return res.json({ text: response.text || '', modelUsed });
  } catch (err: any) {
    // Return generic error to avoid leaking internal details
    if (err.message && err.message.includes('prompt injection detected')) {
      console.warn('Gemini Chat: Prompt injection attempt blocked');
      return res.status(400).json({ error: 'Invalid input - request rejected' });
    }
    console.error('Gemini Chat Error:', err);
    return res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
});

// AI Lawyer / Legal Team Counselor Unified Endpoint
const handleLawyerChat = async (req: Request, res: Response) => {
  try {
    const promptText = req.body.message || req.body.prompt || req.body.query || req.body.input;
    const { history = [], jurisdiction = 'State & Federal Rules', context, agentRole = 'Legal Information Specialist' } = req.body;

    if (!promptText) {
      return res.status(400).json({ error: 'Message or prompt is required.' });
    }
    
    const client = getAI();

    // Sanitize all user inputs
    const sanitizedPrompt = sanitizeUserInput(String(promptText));
    const sanitizedJurisdiction = sanitizeUserInput(String(jurisdiction));
    const sanitizedContext = context ? (typeof context === 'string' ? sanitizeUserInput(context) : JSON.stringify(context)) : 'Pro Se Matter';
    const sanitizedAgentRole = sanitizeUserInput(String(agentRole));

    const lawyerPrompt = `Role: Acquit.ai Legal Team Assistant (${sanitizedAgentRole})
Mission: Assist self-represented (pro se) litigant with legal education, procedural rules, and factual organization.
Jurisdiction: ${sanitizedJurisdiction}
Case Context: ${sanitizedContext}

STRICT MANDATES:
1. Provide plain-English legal information (~8th grade reading level).
2. NEVER say "In my legal opinion"
3. Ground answers in primary statutory authorities, procedural rules, or appellate standards.
4. Structure the response with clear headings, factual breakdown, applicable statutory citations, and procedural next steps.
5. End with the mandatory disclaimer:
"This information is provided for educational and procedural purposes only and does not constitute legal advice. No attorney-client relationship is formed. Consult a licensed attorney for case-specific representation."

User Question: ${sanitizedPrompt}`;

    const { response, modelUsed } = await generateContentWithFallback(client, DEFAULT_MODEL, {
      contents: [createUserMessage(lawyerPrompt)],
      config: {
        systemInstruction: UPL_SYSTEM_PROMPT,
      },
    });

    const text = response.text || 'Unable to generate response.';
    return res.json({
      success: true,
      text,
      agentRole,
      modelUsed,
      timestamp: new Date().toISOString(),
      disclaimer: "This information is provided for educational and procedural purposes only and does not constitute legal advice. No attorney-client relationship is formed.",
    });
  } catch (err: any) {
    if (err.message && err.message.includes('prompt injection detected')) {
      console.warn('Lawyer Chat: Prompt injection attempt blocked');
      return res.status(400).json({ error: 'Invalid input - request rejected' });
    }
    console.error('Lawyer Chat Error:', err);
    return res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
};

geminiRouter.post('/gemini/lawyer', handleLawyerChat);
geminiRouter.post('/gemini/lawyer-chat', handleLawyerChat);
geminiRouter.post('/ai/lawyer', handleLawyerChat);
geminiRouter.post('/lawyer', handleLawyerChat);
geminiRouter.post('/ai/chat', handleLawyerChat);
geminiRouter.post('/chat', handleLawyerChat);

geminiRouter.post('/gemini/legal-info', async (req: Request, res: Response) => {
  try {
    const { prompt, modelName, jurisdiction } = req.body;
    
    const client = getAI();
    let model = modelName || DEFAULT_MODEL;

    const jsonSchema = zodToJsonSchema(LegalInfoResponseSchema);

    const sanitizedPrompt = sanitizeUserInput(String(prompt));
    const sanitizedJurisdiction = jurisdiction ? JSON.stringify(jurisdiction) : JSON.stringify({ state: 'AZ' });

    const { response } = await generateContentWithFallback(client, model, {
      contents: [createUserMessage(`Jurisdiction: ${sanitizedJurisdiction}\n\nLegal Query:\n${sanitizedPrompt}`)],
      config: {
        systemInstruction: UPL_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: jsonSchema as any,
      },
    });

    if (!response.text) {
      throw new Error('No text returned from Gemini');
    }

    const data = JSON.parse(response.text);
    const parsedData = LegalInfoResponseSchema.parse(data);

    return res.json(parsedData);
  } catch (err: any) {
    if (err.message && err.message.includes('prompt injection detected')) {
      console.warn('Legal Info: Prompt injection attempt blocked');
      return res.status(400).json({ error: 'Invalid input - request rejected' });
    }
    console.error('Gemini Legal Info Error:', err);
    return res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
});

// The Clerk AI Assistant (Pro Se Court Guide)
geminiRouter.post('/gemini/clerk-chat', async (req: Request, res: Response) => {
  try {
    const { message, context, jurisdiction = 'Indiana' } = req.body;
    
    const client = getAI();

    const sanitizedMessage = sanitizeUserInput(String(message));
    const sanitizedContext = context ? JSON.stringify(context) : 'General Criminal / Procedural Inquiry';
    const sanitizedJurisdiction = sanitizeUserInput(String(jurisdiction));

    const clerkPrompt = `You are "The Clerk", an AI court procedural guide and legal education assistant for pro se (self-represented) litigants on Acquit.ai.
Jurisdiction: ${sanitizedJurisdiction}
Case Context: ${sanitizedContext}

STRICT MANDATES:
1. Provide plain-English legal information (~8th grade reading level).
2. NEVER say "In my legal opinion"
3. Every procedural rule or deadline MUST cite the active statutory authority. If unknown or unverified, state [Authority Not Verified].
4. Help the self-represented person understand court procedures.
5. End with the mandatory notice:
"This information is provided for educational and procedural purposes only and does not constitute legal advice."

User Question: ${sanitizedMessage}`;

    const { response, modelUsed } = await generateContentWithFallback(client, DEFAULT_MODEL, {
      contents: [createUserMessage(clerkPrompt)],
      config: {
        systemInstruction: UPL_SYSTEM_PROMPT,
      },
    });

    return res.json({
      success: true,
      text: response.text || 'Unable to generate response.',
      modelUsed,
      timestamp: new Date().toISOString(),
      disclaimer: "This information is provided for educational and procedural purposes only and does not constitute legal advice.",
    });
  } catch (err: any) {
    if (err.message && err.message.includes('prompt injection detected')) {
      console.warn('Clerk Chat: Prompt injection attempt blocked');
      return res.status(400).json({ error: 'Invalid input - request rejected' });
    }
    console.error('Clerk Chat Error:', err);
    return res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
});

// Evidence Analysis Endpoint
geminiRouter.post('/gemini/analyze-evidence', async (req: Request, res: Response) => {
  try {
    const { title, description, category, tags, charges } = req.body;
    
    const client = getAI();

    const sanitizedTitle = sanitizeUserInput(String(title));
    const sanitizedDescription = sanitizeUserInput(String(description));
    const sanitizedCategory = sanitizeUserInput(String(category));
    const sanitizedTags = Array.isArray(tags) ? tags.map((t: any) => sanitizeUserInput(String(t))).join(', ') : sanitizeUserInput(String(tags));
    const sanitizedCharges = sanitizeUserInput(String(charges || 'General'));

    const prompt = `Analyze this piece of evidentiary record for a self-represented criminal defense matter:
Title: ${sanitizedTitle}
Category: ${sanitizedCategory}
Description: ${sanitizedDescription}
Tags: ${sanitizedTags}
Charges at Issue: ${sanitizedCharges}

Provide a structured factual analysis:
1. Factual Summary (plain English)
2. Chain of Custody & Authenticity Considerations
3. Potential Evidentiary Issues
4. Relevant Statutory or Precedential Authorities
5. Recommended Procedural Questions

MANDATE: Maintain neutrality, do not calculate win probability, include disclaimer header.`;

    const { response, modelUsed } = await generateContentWithFallback(client, DEFAULT_MODEL, {
      contents: [createUserMessage(prompt)],
      config: { systemInstruction: UPL_SYSTEM_PROMPT },
    });

    return res.json({
      success: true,
      analysis: response.text,
      modelUsed,
      analyzedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err.message && err.message.includes('prompt injection detected')) {
      console.warn('Evidence Analysis: Prompt injection attempt blocked');
      return res.status(400).json({ error: 'Invalid input - request rejected' });
    }
    console.error('Evidence Analysis Error:', err);
    return res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
});

// Legal Document / Motion Drafter
geminiRouter.post('/gemini/draft-motion', async (req: Request, res: Response) => {
  try {
    const { motionType, courtName, caseNumber, defendantName, grounds, requestedRelief } = req.body;
    
    const client = getAI();

    const sanitizedMotionType = sanitizeUserInput(String(motionType || 'Motion'));
    const sanitizedCourtName = sanitizeUserInput(String(courtName || 'Court'));
    const sanitizedCaseNumber = sanitizeUserInput(String(caseNumber || 'Case'));
    const sanitizedDefendantName = sanitizeUserInput(String(defendantName || 'Defendant'));
    const sanitizedGrounds = sanitizeUserInput(String(grounds || 'General'));
    const sanitizedRequestedRelief = sanitizeUserInput(String(requestedRelief || 'Relief'));

    const prompt = `Draft a standard court pleading template for a self-represented litigant:
Motion Type: ${sanitizedMotionType}
Court: ${sanitizedCourtName}
Case No.: ${sanitizedCaseNumber}
Defendant: ${sanitizedDefendantName}
Factual Grounds: ${sanitizedGrounds}
Requested Relief: ${sanitizedRequestedRelief}

MANDATORY FORMAT:
Prepend draft with: [PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW]
Include caption, standard title, factual assertions, statutory authorities, certificate of service, and signature block.`;

    const { response, modelUsed } = await generateContentWithFallback(client, DEFAULT_MODEL, {
      contents: [createUserMessage(prompt)],
      config: { systemInstruction: UPL_SYSTEM_PROMPT },
    });

    return res.json({
      success: true,
      draft: response.text,
      modelUsed,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err.message && err.message.includes('prompt injection detected')) {
      console.warn('Motion Drafting: Prompt injection attempt blocked');
      return res.status(400).json({ error: 'Invalid input - request rejected' });
    }
    console.error('Motion Drafting Error:', err);
    return res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
});

// Neutral Plea Decision Assistant
geminiRouter.post('/gemini/plea-assistant', async (req: Request, res: Response) => {
  try {
    const { charges, pleaOffer, trialRisks, collateralConsequences } = req.body;
    
    const client = getAI();

    const sanitizedCharges = sanitizeUserInput(String(charges || 'General'));
    const sanitizedPleaOffer = sanitizeUserInput(String(pleaOffer || 'General'));
    const sanitizedTrialRisks = sanitizeUserInput(String(trialRisks || 'General'));
    const sanitizedCollateralConsequences = sanitizeUserInput(String(collateralConsequences || 'General'));

    const prompt = `Act as the neutral Plea Decision Assistant for Acquit.ai.
CRITICAL MANDATE: You MUST NOT tell the user to take or reject the plea.

Input Data:
Charges: ${sanitizedCharges}
Plea Offer: ${sanitizedPleaOffer}
Trial Considerations: ${sanitizedTrialRisks}
Collateral Concerns: ${sanitizedCollateralConsequences}

Structure the output into:
1. Summary of Current Charges & Statutory Penalty Maximums
2. Elements of the Proposed Plea Agreement
3. Comparison Framework: Trial Pathway vs. Plea Pathway
4. Collateral Consequences Checklist
5. Structured Questions to Ask Defense Counsel

Disclaimer header and footer required.`;

    const { response, modelUsed } = await generateContentWithFallback(client, DEFAULT_MODEL, {
      contents: [createUserMessage(prompt)],
      config: { systemInstruction: UPL_SYSTEM_PROMPT },
    });

    return res.json({
      success: true,
      decisionStructure: response.text,
      modelUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err.message && err.message.includes('prompt injection detected')) {
      console.warn('Plea Assistant: Prompt injection attempt blocked');
      return res.status(400).json({ error: 'Invalid input - request rejected' });
    }
    console.error('Plea Assistant Error:', err);
    return res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
});

/**
 * Blueprint Feature: CaseDocument AI Summarizer & Timeline Extraction
 * Aligns directly with firebase-blueprint.json CaseDocument (aiSummary, extractedText)
 * and generates candidate TimelineEvent entries.
 */
const handleDocumentSummary = async (req: Request, res: Response) => {
  try {
    const { matterId, title, extractedText, type = 'filing', jurisdiction = 'Federal & State' } = req.body;

    if (!extractedText || String(extractedText).trim().length === 0) {
      return res.status(400).json({ error: 'extractedText is required to generate an AI summary.' });
    }

    const client = getAI();
    const sanitizedTitle = sanitizeUserInput(String(title || 'Legal Document'));
    const sanitizedText = sanitizeUserInput(String(extractedText).slice(0, 48000));
    const sanitizedType = sanitizeUserInput(String(type));
    const sanitizedJurisdiction = sanitizeUserInput(String(jurisdiction));

    const prompt = `Analyze this legal document for a self-represented (pro se) litigant according to the Chain of Command Blueprint:
Document Title: ${sanitizedTitle}
Declared Type: ${sanitizedType}
Jurisdiction: ${sanitizedJurisdiction}
Document Text:
${sanitizedText}

TASK:
1. Generate an objective, plain-English summary (max 4500 characters) covering:
   - Document Overview & Parties
   - Substantive Claims, Allegations, or Orders
   - Key Procedural Deadlines & Hearing Notices
   - Evidentiary Inconsistencies or Unverified Claims
2. Classify the document into one of the blueprint types:
   ["filing", "evidence", "order", "correspondence", "transcript", "motion", "brief", "memo"]
3. Extract any chronological factual events in JSON format matching the TimelineEvent blueprint:
   Each event must have:
   - title: concise title
   - eventDate: ISO 8601 string or date description
   - eventType: one of ["hearing", "filing_deadline", "discovery_deadline", "arrest", "general", "appearance", "motion", "order", "plea"]
   - description: brief neutral description

MANDATORY RULES:
- Never say "In my legal opinion"
- Prepend with: [PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW]
- Append with the mandatory educational disclaimer.`;

    const { response, modelUsed } = await generateContentWithFallback(client, 'gemini-3.8-flash', {
      contents: [createUserMessage(prompt)],
      config: {
        systemInstruction: UPL_SYSTEM_PROMPT,
        temperature: 0.2,
      },
    });

    const rawText = response.text || '';

    // Safe extraction of any embedded JSON timeline events block if generated
    let extractedTimelineEvents: Array<{ title: string; eventDate: string; eventType: string; description: string }> = [];
    try {
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/\[\s*\{\s*"title"[\s\S]*?\}\s*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        if (Array.isArray(parsed)) {
          extractedTimelineEvents = parsed.slice(0, 10);
        }
      }
    } catch {
      // Fallback: events handled in text format
    }

    return res.json({
      success: true,
      matterId: matterId || null,
      title: sanitizedTitle,
      type: sanitizedType,
      aiSummary: rawText.slice(0, 5000),
      extractedTimelineEvents,
      modelUsed,
      generatedAt: new Date().toISOString(),
      disclaimer: "This information is provided for educational and procedural purposes only and does not constitute legal advice. No attorney-client relationship is formed. Consult a licensed attorney for case-specific representation."
    });
  } catch (err: any) {
    if (err.message && err.message.includes('prompt injection detected')) {
      console.warn('Document Summary: Prompt injection attempt blocked');
      return res.status(400).json({ error: 'Invalid input - request rejected' });
    }
    console.error('Document Summary Error:', err);
    return res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
};

geminiRouter.post('/gemini/document-summary', handleDocumentSummary);
geminiRouter.post('/ai/document-summary', handleDocumentSummary);

/**
 * Blueprint Feature: EvidenceItem Relevance Scorer
 * Aligns directly with firebase-blueprint.json EvidenceItem (relevanceScore: number)
 */
const handleScoreEvidence = async (req: Request, res: Response) => {
  try {
    const { matterId, title, description, dateAcquired, charges = 'General Offense Allegations' } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Both title and description are required to score evidence.' });
    }

    const client = getAI();
    const sanitizedTitle = sanitizeUserInput(String(title));
    const sanitizedDesc = sanitizeUserInput(String(description));
    const sanitizedCharges = sanitizeUserInput(String(charges));
    const sanitizedDate = dateAcquired ? sanitizeUserInput(String(dateAcquired)) : 'Unknown';

    const prompt = `Evaluate this EvidenceItem for a pro se litigant case matter:
Evidence Title: ${sanitizedTitle}
Description / Notes: ${sanitizedDesc}
Date Acquired: ${sanitizedDate}
Relevant Charges / Allegations: ${sanitizedCharges}

TASK:
1. Assign a numeric relevance score between 0.00 and 1.00 based on standard evidentiary rules (probative value vs prejudice, factual nexus to elements of proof).
2. Detail Chain of Custody & Authentication considerations (e.g. metadata, original source, timestamp verification).
3. Detail admissibility grounds under Federal/State Rules of Evidence (e.g. hearsay exceptions, business records, Rule 403 balancing).
4. Provide 3 specific procedural questions for the user to examine regarding this exhibit.

OUTPUT FORMAT:
First line: SCORE: <0.00 to 1.00>
Followed by structured sections.
MANDATE: Never say "In my legal opinion". Prepend with SRL header and end with educational disclaimer.`;

    const { response, modelUsed } = await generateContentWithFallback(client, 'gemini-3.8-flash', {
      contents: [createUserMessage(prompt)],
      config: {
        systemInstruction: UPL_SYSTEM_PROMPT,
        temperature: 0.2,
      },
    });

    const rawText = response.text || '';
    let relevanceScore = 0.5;
    const scoreMatch = rawText.match(/SCORE:\s*([0-1]?\.\d+)/i);
    if (scoreMatch && scoreMatch[1]) {
      const parsed = parseFloat(scoreMatch[1]);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        relevanceScore = parsed;
      }
    }

    return res.json({
      success: true,
      matterId: matterId || null,
      title: sanitizedTitle,
      relevanceScore,
      analysis: rawText,
      modelUsed,
      scoredAt: new Date().toISOString(),
      disclaimer: "This information is provided for educational and procedural purposes only and does not constitute legal advice."
    });
  } catch (err: any) {
    if (err.message && err.message.includes('prompt injection detected')) {
      console.warn('Score Evidence: Prompt injection attempt blocked');
      return res.status(400).json({ error: 'Invalid input - request rejected' });
    }
    console.error('Score Evidence Error:', err);
    return res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
};

geminiRouter.post('/gemini/score-evidence', handleScoreEvidence);
geminiRouter.post('/ai/score-evidence', handleScoreEvidence);

/**
 * RAG Evidence & Document Library Search
 * Searches across user's stored evidence, retrieves relevant exhibits,
 * and synthesizes an evidence-grounded procedural answer with exact citations.
 */
const handleRagEvidenceSearch = async (req: Request, res: Response) => {
  try {
    const { query, evidence = [], matterTitle, jurisdiction = 'State & Federal' } = req.body;

    if (!query || String(query).trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const client = getAI();
    const sanitizedQuery = sanitizeUserInput(String(query));
    const sanitizedMatter = matterTitle ? sanitizeUserInput(String(matterTitle)) : 'Active Legal Matter';
    const sanitizedJurisdiction = sanitizeUserInput(String(jurisdiction));

    // Format stored evidence as structured RAG context
    const evidenceContext = Array.isArray(evidence) && evidence.length > 0
      ? evidence.map((item: any, idx: number) => {
          return `--- EXHIBIT ${item.exhibitNumber || `Exhibit ${idx + 1}`}: ${item.title || 'Untitled'} ---
Type: ${item.type || 'Document'}
Date Acquired: ${item.dateAcquired || 'Unknown'}
Custodian: ${item.custodian || 'Unknown'}
Chain of Custody Status: ${item.chainOfCustodyStatus || 'Not specified'}
Relevant Charge / Element: ${item.relevantCharge || 'General'}
Summary / Content:
${item.summary || item.description || ''}
Storage Hash: ${item.storageHash || 'Verified'}`;
        }).join('\n\n')
      : 'No stored evidence exhibits available in case locker.';

    const prompt = `You are the Chain of Command RAG Document Retrieval and Evidence Synthesis Engine for a self-represented (pro se) litigant.
Case Matter: ${sanitizedMatter}
Jurisdiction: ${sanitizedJurisdiction}

USER INQUIRY:
"${sanitizedQuery}"

STORED CASE EVIDENCE & DOCUMENT LIBRARY:
${evidenceContext}

TASK:
1. Conduct a deep RAG analysis matching the user's query directly against the stored evidence exhibits above.
2. In the answer, cite the specific Exhibit Numbers (e.g. Exhibit A, Exhibit B, Exhibit C) and provenance details (timestamps, dates, custodians) that answer the question or substantiate/refute the claim.
3. If the stored evidence contains contradictions (e.g., between an incident report and video surveillance or store receipts), highlight them explicitly.
4. If the stored evidence does not contain sufficient facts to answer the question, explicitly state: "[Information Not Found in Stored Evidence - Request Supplemental Discovery or Subpoena Records]".
5. Provide actionable procedural next steps for a self-represented litigant (e.g., filing a motion to compel, subpoenaing records, or introducing the exhibit at hearing).

STRICT MANDATES:
- NEVER use the phrase "In my legal opinion".
- Prepend output with:
[PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW]
- Append the mandatory educational disclaimer.`;

    const { response, modelUsed } = await generateContentWithFallback(client, 'gemini-3.8-flash', {
      contents: [createUserMessage(prompt)],
      config: {
        systemInstruction: UPL_SYSTEM_PROMPT,
        temperature: 0.2,
      },
    });

    const rawText = response.text || '';

    // Extract mentioned exhibits from the text
    const mentionedExhibits: string[] = [];
    if (Array.isArray(evidence)) {
      for (const item of evidence) {
        if (item.exhibitNumber && rawText.includes(item.exhibitNumber)) {
          mentionedExhibits.push(item.exhibitNumber);
        }
      }
    }

    return res.json({
      success: true,
      query: sanitizedQuery,
      answer: rawText,
      modelUsed,
      citedExhibits: mentionedExhibits,
      timestamp: new Date().toISOString(),
      disclaimer: "This information is provided for educational and procedural purposes only and does not constitute legal advice."
    });
  } catch (err: any) {
    if (err.message && err.message.includes('prompt injection detected')) {
      console.warn('RAG Evidence Search: Prompt injection attempt blocked');
      return res.status(400).json({ error: 'Invalid input - request rejected' });
    }
    console.error('RAG Evidence Search Error:', err);
    return res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
};

geminiRouter.post('/gemini/rag-evidence', handleRagEvidenceSearch);
geminiRouter.post('/ai/rag-evidence', handleRagEvidenceSearch);
geminiRouter.post('/rag/search', handleRagEvidenceSearch);

export default geminiRouter;
