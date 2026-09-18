import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { LegalInfoResponseSchema } from '../types/legalResponse';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const geminiRouter = Router();

function getAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is missing');
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

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
      console.warn(`[Gemini Fallback] Model "${model}" failed (${err?.status || err?.code || err?.message?.slice(0, 80)}). Trying fallback model...`);
    }
  }

  throw lastError || new Error("All Gemini model fallbacks failed");
}

geminiRouter.post('/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { history = [], prompt, systemInstruction, modelName, useSearch, useHighThinking } = req.body;
    const client = getAI();

    let model = modelName || DEFAULT_MODEL;
    let config: any = {};

    config.systemInstruction = systemInstruction ? `${UPL_SYSTEM_PROMPT}\n\nAdditional context: ${systemInstruction}` : UPL_SYSTEM_PROMPT;
    if (useSearch) config.tools = [{ googleSearch: {} }];

    if (useHighThinking) {
      model = 'gemini-3.1-pro-preview';
    }

    const { response, modelUsed } = await generateContentWithFallback(client, model, {
      contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
      config,
    });

    return res.json({ text: response.text || '', modelUsed });
  } catch (err: any) {
    console.error('Gemini Chat Error:', err);
    return res.status(500).json({ error: err.message || 'AI request failed' });
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

    const lawyerPrompt = `Role: Acquit.ai Legal Team Assistant (${agentRole})
Mission: Assist self-represented (pro se) litigant with legal education, procedural rules, and factual organization.
Jurisdiction: ${jurisdiction}
Case Context: ${context ? (typeof context === 'string' ? context : JSON.stringify(context)) : 'Pro Se Matter'}

STRICT MANDATES:
1. Provide plain-English legal information (~8th grade reading level).
2. NEVER say "In my legal opinion".
3. Ground answers in primary statutory authorities, procedural rules, or appellate standards.
4. Structure the response with clear headings, factual breakdown, applicable statutory citations, and procedural next steps.
5. End with the mandatory disclaimer:
"This information is provided for educational and procedural purposes only and does not constitute legal advice. No attorney-client relationship is formed. Consult a licensed attorney for case-specific representation."

User Question: ${promptText}`;

    const { response, modelUsed } = await generateContentWithFallback(client, DEFAULT_MODEL, {
      contents: [...history, { role: 'user', parts: [{ text: lawyerPrompt }] }],
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
    console.error('Lawyer Chat Error:', err);
    return res.status(500).json({ error: err.message || 'AI Lawyer assistant currently unavailable' });
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

    const { response } = await generateContentWithFallback(client, model, {
      contents: [{ role: 'user', parts: [{ text: `Jurisdiction: ${JSON.stringify(jurisdiction || { state: 'AZ' })}\n\nLegal Query:\n${prompt}` }] }],
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
    console.error('Gemini Legal Info Error:', err);
    return res.status(500).json({ error: err.message || 'AI request failed' });
  }
});

// The Clerk AI Assistant (Pro Se Court Guide)
geminiRouter.post('/gemini/clerk-chat', async (req: Request, res: Response) => {
  try {
    const { message, context, jurisdiction = 'Indiana' } = req.body;
    const client = getAI();

    const clerkPrompt = `You are "The Clerk", an AI court procedural guide and legal education assistant for pro se (self-represented) litigants on Acquit.ai.
Jurisdiction: ${jurisdiction}
Case Context: ${context ? JSON.stringify(context) : 'General Criminal / Procedural Inquiry'}

STRICT MANDATES:
1. Provide plain-English legal information (~8th grade reading level).
2. NEVER say "In my legal opinion".
3. Every procedural rule or deadline MUST cite the active statutory authority (e.g. Ind. Code § ..., Ind. R. Crim. P. ..., or local court rule). If unknown or unverified, state [Authority Not Verified - Consult Local Court Rules].
4. Help the self-represented person understand court procedures, what to expect at hearings, how to address the judge ("Your Honor"), and filing logistics.
5. End with the mandatory notice:
"This information is provided for educational and procedural purposes only and does not constitute legal advice. No attorney-client relationship is formed. Consult a licensed attorney for case-specific representation."

User Question: ${message}`;

    const { response, modelUsed } = await generateContentWithFallback(client, DEFAULT_MODEL, {
      contents: clerkPrompt,
      config: {
        systemInstruction: UPL_SYSTEM_PROMPT,
      },
    });

    return res.json({
      success: true,
      text: response.text || 'Unable to generate response.',
      modelUsed,
      timestamp: new Date().toISOString(),
      disclaimer: "This information is provided for educational and procedural purposes only and does not constitute legal advice. No attorney-client relationship is formed.",
    });
  } catch (err: any) {
    console.error('Clerk Chat Error:', err);
    return res.status(500).json({ error: err.message || 'Clerk assistant unavailable' });
  }
});

// Evidence Analysis Endpoint
geminiRouter.post('/gemini/analyze-evidence', async (req: Request, res: Response) => {
  try {
    const { title, description, category, tags, charges } = req.body;
    const client = getAI();

    const prompt = `Analyze this piece of evidentiary record for a self-represented criminal defense matter:
Title: ${title}
Category: ${category}
Description: ${description}
Tags: ${Array.isArray(tags) ? tags.join(', ') : tags}
Charges at Issue: ${charges || 'State v. Marlowe (Alleged Theft / Fourth Amendment stop)'}

Provide a structured factual analysis:
1. Factual Summary (plain English)
2. Chain of Custody & Authenticity Considerations
3. Potential Evidentiary Issues (e.g., Fourth Amendment search, Brady exculpatory material, hearsay exception, chain-of-custody gap)
4. Relevant Statutory or Precedential Authorities (cite specific rules/cases)
5. Recommended Procedural Questions for Preliminary Hearing or Motion in Limine

MANDATE: Maintain neutrality, do not calculate win probability, include disclaimer header "[PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW]".`;

    const { response, modelUsed } = await generateContentWithFallback(client, DEFAULT_MODEL, {
      contents: prompt,
      config: { systemInstruction: UPL_SYSTEM_PROMPT },
    });

    return res.json({
      success: true,
      analysis: response.text,
      modelUsed,
      analyzedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Evidence Analysis Error:', err);
    return res.status(500).json({ error: err.message || 'Evidence analysis failed' });
  }
});

// Legal Document / Motion Drafter
geminiRouter.post('/gemini/draft-motion', async (req: Request, res: Response) => {
  try {
    const { motionType, courtName, caseNumber, defendantName, grounds, requestedRelief } = req.body;
    const client = getAI();

    const prompt = `Draft a standard court pleading template for a self-represented litigant:
Motion Type: ${motionType || 'Motion for Discovery of Exculpatory Evidence'}
Court: ${courtName || 'Marion County Superior Court, Criminal Division'}
Case No.: ${caseNumber || 'IN-MAR-24-0187'}
Defendant: ${defendantName || 'Self-Represented Litigant'}
Factual Grounds: ${grounds || 'Request for body-cam footage and officer audio recording'}
Requested Relief: ${requestedRelief || 'Order compelling prosecutor to produce discovery packet'}

MANDATORY FORMAT:
Prepend draft with:
"[PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW]"

Include caption, standard title, factual assertions (marked [USER FACTS]), statutory authorities, certificate of service, and signature block for Pro Se Litigant.
Append footer disclaimer.`;

    const { response, modelUsed } = await generateContentWithFallback(client, DEFAULT_MODEL, {
      contents: prompt,
      config: { systemInstruction: UPL_SYSTEM_PROMPT },
    });

    return res.json({
      success: true,
      draft: response.text,
      modelUsed,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Motion Drafting Error:', err);
    return res.status(500).json({ error: err.message || 'Drafting failed' });
  }
});

// Neutral Plea Decision Assistant
geminiRouter.post('/gemini/plea-assistant', async (req: Request, res: Response) => {
  try {
    const { charges, pleaOffer, trialRisks, collateralConsequences } = req.body;
    const client = getAI();

    const prompt = `Act as the neutral Plea Decision Assistant for Acquit.ai.
CRITICAL MANDATE: You MUST NOT tell the user to take or reject the plea. You must structure the decision neutrally for the user and their counsel.

Input Data:
Charges: ${charges || 'Ind. Code § 35-43-4-2 (Theft)'}
Plea Offer: ${pleaOffer || 'Misdemeanor reduction with probation'}
Trial Considerations: ${trialRisks || 'Potential mandatory minimums if convicted vs evidentiary weaknesses in search'}
Collateral Concerns: ${collateralConsequences || 'Driver license suspension, employment background checks'}

Structure the output into:
1. Summary of Current Charges & Statutory Penalty Maximums
2. Elements of the Proposed Plea Agreement
3. Comparison Framework: Trial Pathway vs. Plea Pathway (neutral pros and cons)
4. Collateral Consequences Checklist (Housing, Employment, Licensing, Immigration if applicable)
5. Structured Questions to Ask Defense Counsel or the Public Defender Before Deciding

Disclaimer header and footer required.`;

    const { response, modelUsed } = await generateContentWithFallback(client, DEFAULT_MODEL, {
      contents: prompt,
      config: { systemInstruction: UPL_SYSTEM_PROMPT },
    });

    return res.json({
      success: true,
      decisionStructure: response.text,
      modelUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Plea Assistant Error:', err);
    return res.status(500).json({ error: err.message || 'Plea assistant failed' });
  }
});

export default geminiRouter;
