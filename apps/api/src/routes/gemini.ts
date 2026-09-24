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

export default geminiRouter;
