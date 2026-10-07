/**
 * Chain of Command — Local AI routes (Ollama).
 * Legacy path prefixes (/gemini/*, /ai/*) are preserved for frontend compatibility.
 * All generation goes through Ollama — no cloud Gemini calls.
 */
import { Router, Request, Response } from 'express';
import { OllamaAdapter, type ChatMessage } from '../ai/model-gateway';
import { detectPromptInjection } from '../ai/runtime';

export const geminiRouter = Router();

export const UPL_SYSTEM_PROMPT = `You are a legal document assistant and educational information system for Chain of Command Legal OS.
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

const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const OLLAMA_BASE =
  process.env.OLLAMA_BASE_URL || process.env.OLLAMA_URL || 'http://localhost:11434';

const ollama = new OllamaAdapter(OLLAMA_BASE);

const GENERIC_ERROR_MESSAGE = 'AI request failed';

function sanitizeUserInput(input: string): string {
  if (!input) return '';
  if (detectPromptInjection(input)) {
    throw new Error('Invalid input - prompt injection detected');
  }
  return String(input);
}

async function generateWithOllama(
  messages: ChatMessage[],
  model?: string
): Promise<{ text: string; modelUsed: string }> {
  const response = await ollama.complete({
    provider: 'ollama',
    model: model || DEFAULT_MODEL,
    messages,
    maxTokens: 4096,
  });
  return { text: response.content || '', modelUsed: response.model };
}

function systemAndUser(system: string, user: string): ChatMessage[] {
  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

geminiRouter.post('/gemini/chat', async (req: Request, res: Response) => {
  try {
    if (req.body.systemInstruction) {
      console.warn('Chat: Client attempted to override system instruction - rejected');
      return res.status(400).json({ error: 'System instructions are server-controlled only' });
    }

    const userPrompt = sanitizeUserInput(req.body.prompt || '');
    const history = Array.isArray(req.body.history) ? req.body.history : [];

    const messages: ChatMessage[] = [{ role: 'system', content: UPL_SYSTEM_PROMPT }];
    for (const h of history) {
      if (typeof h === 'string') {
        messages.push({ role: 'user', content: sanitizeUserInput(h) });
      } else if (h?.role === 'user' && Array.isArray(h.parts)) {
        const text = h.parts.map((p: any) => p?.text || '').join(' ');
        messages.push({ role: 'user', content: sanitizeUserInput(text) });
      } else if (h?.role === 'assistant' || h?.role === 'model') {
        const text = typeof h.content === 'string' ? h.content : h.parts?.map((p: any) => p?.text || '').join(' ') || '';
        messages.push({ role: 'assistant', content: String(text) });
      }
    }
    messages.push({ role: 'user', content: userPrompt });

    const { text, modelUsed } = await generateWithOllama(messages, req.body.modelName);
    return res.json({ text, modelUsed, provider: 'ollama' });
  } catch (err: any) {
    if (err.message?.includes('prompt injection detected')) {
      return res.status(400).json({ error: 'Invalid input - request rejected' });
    }
    console.error('Ollama Chat Error:', err);
    return res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
});

const handleLawyerChat = async (req: Request, res: Response) => {
  try {
    const promptText = req.body.message || req.body.prompt || req.body.query || req.body.input;
    const {
      jurisdiction = 'State & Federal Rules',
      context,
      agentRole = 'Legal Information Specialist',
    } = req.body;

    if (!promptText) {
      return res.status(400).json({ error: 'Message or prompt is required.' });
    }

    const sanitizedPrompt = sanitizeUserInput(String(promptText));
    const sanitizedJurisdiction = sanitizeUserInput(String(jurisdiction));
    const sanitizedContext = context
      ? typeof context === 'string'
        ? sanitizeUserInput(context)
        : JSON.stringify(context)
      : 'Pro Se Matter';
    const sanitizedAgentRole = sanitizeUserInput(String(agentRole));

    const lawyerPrompt = `Role: Chain of Command Legal Team Assistant (${sanitizedAgentRole})
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

    const { text, modelUsed } = await generateWithOllama(
      systemAndUser(UPL_SYSTEM_PROMPT, lawyerPrompt),
      req.body.modelName
    );

    return res.json({
      success: true,
      text: text || 'Unable to generate response.',
      agentRole,
      modelUsed,
      provider: 'ollama',
      timestamp: new Date().toISOString(),
      disclaimer:
        'This information is provided for educational and procedural purposes only and does not constitute legal advice. No attorney-client relationship is formed.',
    });
  } catch (err: any) {
    if (err.message?.includes('prompt injection detected')) {
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
    const { prompt, jurisdiction } = req.body;
    const sanitizedPrompt = sanitizeUserInput(String(prompt || ''));
    const sanitizedJurisdiction = jurisdiction
      ? JSON.stringify(jurisdiction)
      : JSON.stringify({ state: 'IN' });

    const userMsg = `Jurisdiction: ${sanitizedJurisdiction}

Respond in plain English legal information only (not advice). Include citations and procedural steps.

Legal Query:
${sanitizedPrompt}`;

    const { text, modelUsed } = await generateWithOllama(
      systemAndUser(UPL_SYSTEM_PROMPT, userMsg),
      req.body.modelName
    );

    return res.json({
      disclaimer:
        'This information is provided for educational and procedural purposes only and does not constitute legal advice. No attorney-client relationship is formed. Consult a licensed attorney for case-specific representation.',
      jurisdiction: typeof jurisdiction === 'object' ? jurisdiction : { state: 'IN' },
      text,
      modelUsed,
      provider: 'ollama',
      requiresHumanReview: true,
      outcomePredictionAllowed: false,
    });
  } catch (err: any) {
    if (err.message?.includes('prompt injection detected')) {
      return res.status(400).json({ error: 'Invalid input - request rejected' });
    }
    console.error('Legal Info Error:', err);
    return res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
});

geminiRouter.post('/gemini/clerk-chat', async (req: Request, res: Response) => {
  try {
    const { message, context, jurisdiction = 'Indiana' } = req.body;
    const sanitizedMessage = sanitizeUserInput(String(message || ''));
    const sanitizedContext = context ? JSON.stringify(context) : 'General Criminal / Procedural Inquiry';
    const sanitizedJurisdiction = sanitizeUserInput(String(jurisdiction));

    const clerkPrompt = `You are "The Clerk", an AI court procedural guide for Chain of Command Legal OS.
Jurisdiction: ${sanitizedJurisdiction}
Case Context: ${sanitizedContext}

STRICT MANDATES:
1. Provide plain-English legal information (~8th grade reading level).
2. NEVER say "In my legal opinion"
3. Every procedural rule or deadline MUST cite the active statutory authority. If unknown, state [Authority Not Verified].
4. Help the self-represented person understand court procedures.
5. End with: "This information is provided for educational and procedural purposes only and does not constitute legal advice."

User Question: ${sanitizedMessage}`;

    const { text, modelUsed } = await generateWithOllama(
      systemAndUser(UPL_SYSTEM_PROMPT, clerkPrompt)
    );

    return res.json({
      success: true,
      text: text || 'Unable to generate response.',
      modelUsed,
      provider: 'ollama',
      timestamp: new Date().toISOString(),
      disclaimer:
        'This information is provided for educational and procedural purposes only and does not constitute legal advice.',
    });
  } catch (err: any) {
    if (err.message?.includes('prompt injection detected')) {
      return res.status(400).json({ error: 'Invalid input - request rejected' });
    }
    console.error('Clerk Chat Error:', err);
    return res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
});

geminiRouter.post('/gemini/analyze-evidence', async (req: Request, res: Response) => {
  try {
    const { title, description, category, tags, charges } = req.body;
    const sanitizedTitle = sanitizeUserInput(String(title || ''));
    const sanitizedDescription = sanitizeUserInput(String(description || ''));
    const sanitizedCategory = sanitizeUserInput(String(category || ''));
    const sanitizedTags = Array.isArray(tags)
      ? tags.map((t: any) => sanitizeUserInput(String(t))).join(', ')
      : sanitizeUserInput(String(tags || ''));
    const sanitizedCharges = sanitizeUserInput(String(charges || 'General'));

    const prompt = `Analyze this evidentiary record for a self-represented criminal defense matter on Chain of Command:
Title: ${sanitizedTitle}
Category: ${sanitizedCategory}
Description: ${sanitizedDescription}
Tags: ${sanitizedTags}
Charges at Issue: ${sanitizedCharges}

Provide structured factual analysis:
1. Factual Summary (plain English)
2. Chain of Custody & Authenticity Considerations
3. Potential Evidentiary Issues
4. Relevant Statutory or Precedential Authorities
5. Recommended Procedural Questions

MANDATE: Maintain neutrality, do not calculate win probability, include disclaimer header.`;

    const { text, modelUsed } = await generateWithOllama(
      systemAndUser(UPL_SYSTEM_PROMPT, prompt)
    );

    return res.json({
      success: true,
      analysis: text,
      modelUsed,
      provider: 'ollama',
      analyzedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err.message?.includes('prompt injection detected')) {
      return res.status(400).json({ error: 'Invalid input - request rejected' });
    }
    console.error('Evidence Analysis Error:', err);
    return res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
});

geminiRouter.post('/gemini/draft-motion', async (req: Request, res: Response) => {
  try {
    const { motionType, courtName, caseNumber, defendantName, grounds, requestedRelief } = req.body;

    const prompt = `Draft a standard court pleading template for a self-represented litigant (Chain of Command):
Motion Type: ${sanitizeUserInput(String(motionType || 'Motion'))}
Court: ${sanitizeUserInput(String(courtName || 'Court'))}
Case No.: ${sanitizeUserInput(String(caseNumber || 'Case'))}
Defendant: ${sanitizeUserInput(String(defendantName || 'Defendant'))}
Factual Grounds: ${sanitizeUserInput(String(grounds || 'General'))}
Requested Relief: ${sanitizeUserInput(String(requestedRelief || 'Relief'))}

MANDATORY FORMAT:
Prepend draft with: [PREPARED FOR SELF-REPRESENTED LITIGANT - NOT LEGAL ADVICE - REQUIRES INDEPENDENT HUMAN REVIEW]
Include caption, standard title, factual assertions, statutory authorities, certificate of service, and signature block.`;

    const { text, modelUsed } = await generateWithOllama(
      systemAndUser(UPL_SYSTEM_PROMPT, prompt)
    );

    return res.json({
      success: true,
      draft: text,
      modelUsed,
      provider: 'ollama',
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err.message?.includes('prompt injection detected')) {
      return res.status(400).json({ error: 'Invalid input - request rejected' });
    }
    console.error('Motion Drafting Error:', err);
    return res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
});

geminiRouter.post('/gemini/plea-assistant', async (req: Request, res: Response) => {
  try {
    const { charges, pleaOffer, trialRisks, collateralConsequences } = req.body;

    const prompt = `Act as the neutral Plea Decision Assistant for Chain of Command Legal OS.
CRITICAL MANDATE: You MUST NOT tell the user to take or reject the plea.

Input Data:
Charges: ${sanitizeUserInput(String(charges || 'General'))}
Plea Offer: ${sanitizeUserInput(String(pleaOffer || 'General'))}
Trial Considerations: ${sanitizeUserInput(String(trialRisks || 'General'))}
Collateral Concerns: ${sanitizeUserInput(String(collateralConsequences || 'General'))}

Structure the output into:
1. Summary of Current Charges & Statutory Penalty Maximums
2. Elements of the Proposed Plea Agreement
3. Comparison Framework: Trial Pathway vs. Plea Pathway
4. Collateral Consequences Checklist
5. Structured Questions to Ask Defense Counsel

Disclaimer header and footer required.`;

    const { text, modelUsed } = await generateWithOllama(
      systemAndUser(UPL_SYSTEM_PROMPT, prompt)
    );

    return res.json({
      success: true,
      decisionStructure: text,
      modelUsed,
      provider: 'ollama',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err.message?.includes('prompt injection detected')) {
      return res.status(400).json({ error: 'Invalid input - request rejected' });
    }
    console.error('Plea Assistant Error:', err);
    return res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
});

const handleDocumentSummary = async (req: Request, res: Response) => {
  try {
    const { title, extractedText, type = 'filing', jurisdiction = 'Federal & State' } = req.body;

    if (!extractedText || String(extractedText).trim().length === 0) {
      return res.status(400).json({ error: 'extractedText is required to generate an AI summary.' });
    }

    const sanitizedTitle = sanitizeUserInput(String(title || 'Legal Document'));
    const sanitizedText = sanitizeUserInput(String(extractedText).slice(0, 48000));
    const sanitizedType = sanitizeUserInput(String(type));
    const sanitizedJurisdiction = sanitizeUserInput(String(jurisdiction));

    const prompt = `Analyze this legal document for a self-represented litigant on Chain of Command:
Document Title: ${sanitizedTitle}
Declared Type: ${sanitizedType}
Jurisdiction: ${sanitizedJurisdiction}
Document Text:
${sanitizedText}

TASK:
1. Generate an objective, plain-English summary (max 4500 characters).
2. List key procedural deadlines if any.
3. Note evidentiary inconsistencies or unverified claims.
Include the mandatory UPL disclaimer.`;

    const { text, modelUsed } = await generateWithOllama(
      systemAndUser(UPL_SYSTEM_PROMPT, prompt)
    );

    return res.json({
      success: true,
      summary: text,
      modelUsed,
      provider: 'ollama',
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err.message?.includes('prompt injection detected')) {
      return res.status(400).json({ error: 'Invalid input - request rejected' });
    }
    console.error('Document Summary Error:', err);
    return res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
};

geminiRouter.post('/gemini/document-summary', handleDocumentSummary);
geminiRouter.post('/ai/document-summary', handleDocumentSummary);

const handleScoreEvidence = async (req: Request, res: Response) => {
  try {
    const { title, description, category } = req.body;
    const prompt = `Score this exhibit for organizational completeness only (not case strength) for Chain of Command:
Title: ${sanitizeUserInput(String(title || ''))}
Category: ${sanitizeUserInput(String(category || ''))}
Description: ${sanitizeUserInput(String(description || ''))}

Return: completeness notes, missing metadata fields, and suggested tags. No outcome predictions.`;

    const { text, modelUsed } = await generateWithOllama(
      systemAndUser(UPL_SYSTEM_PROMPT, prompt)
    );

    return res.json({
      success: true,
      scoreNotes: text,
      modelUsed,
      provider: 'ollama',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Score Evidence Error:', err);
    return res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
};

geminiRouter.post('/gemini/score-evidence', handleScoreEvidence);
geminiRouter.post('/ai/score-evidence', handleScoreEvidence);

geminiRouter.post('/gemini/rag-evidence', async (req: Request, res: Response) => {
  try {
    const { query, evidence, matterTitle, jurisdiction } = req.body;
    const prompt = `Chain of Command RAG evidence query.
Matter: ${sanitizeUserInput(String(matterTitle || 'Matter'))}
Jurisdiction: ${sanitizeUserInput(String(jurisdiction || 'Unknown'))}
Query: ${sanitizeUserInput(String(query || ''))}
Evidence pack: ${sanitizeUserInput(JSON.stringify(evidence || []).slice(0, 20000))}

Answer using only the supplied evidence. Cite exhibit titles. Educational information only.`;

    const { text, modelUsed } = await generateWithOllama(
      systemAndUser(UPL_SYSTEM_PROMPT, prompt)
    );

    return res.json({
      success: true,
      query: query || '',
      answer: text,
      modelUsed,
      provider: 'ollama',
      citedExhibits: [],
      timestamp: new Date().toISOString(),
      disclaimer:
        'This information is provided for educational and procedural purposes only and does not constitute legal advice.',
    });
  } catch (err: any) {
    console.error('RAG Evidence Error:', err);
    return res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
  }
});

/** Health check for local Ollama */
geminiRouter.get('/ai/ollama/health', async (_req: Request, res: Response) => {
  const health = await ollama.health();
  const models = health.ok ? await ollama.listModels() : [];
  return res.status(health.ok ? 200 : 503).json({
    provider: 'ollama',
    baseUrl: OLLAMA_BASE,
    defaultModel: DEFAULT_MODEL,
    ...health,
    models,
  });
});
