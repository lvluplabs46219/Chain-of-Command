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

geminiRouter.post('/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { history = [], prompt, systemInstruction, modelName, useSearch, useHighThinking } = req.body;
    const client = getAI();

    let model = modelName || 'gemini-2.5-flash';
    let config: any = {};

    config.systemInstruction = systemInstruction ? `${UPL_SYSTEM_PROMPT}\n\nAdditional context: ${systemInstruction}` : UPL_SYSTEM_PROMPT;
    if (useSearch) config.tools = [{ googleSearch: {} }];

    if (useHighThinking) {
      model = 'gemini-2.5-pro';
    }

    const response = await client.models.generateContent({
      model: model,
      contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
      config,
    });

    return res.json({ text: response.text || '' });
  } catch (err: any) {
    console.error('Gemini Chat Error:', err);
    return res.status(500).json({ error: err.message || 'AI request failed' });
  }
});

geminiRouter.post('/gemini/legal-info', async (req: Request, res: Response) => {
  try {
    const { prompt, modelName, jurisdiction } = req.body;
    const client = getAI();
    let model = modelName || 'gemini-2.5-flash';

    const jsonSchema = zodToJsonSchema(LegalInfoResponseSchema);

    const response = await client.models.generateContent({
      model,
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

export default geminiRouter;
