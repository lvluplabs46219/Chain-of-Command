import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';

export const geminiRouter = Router();

function getAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is missing');
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

geminiRouter.post('/gemini/chat', async (req, res) => {
  try {
    const { history = [], prompt, systemInstruction, modelName, useSearch, useHighThinking } = req.body;
    const client = getAI();
    
    let model = modelName || 'gemini-2.5-flash';
    let config: any = {};
    
    if (systemInstruction) config.systemInstruction = systemInstruction;
    if (useSearch) config.tools = [{ googleSearch: {} }];
    
    if (useHighThinking) {
      model = 'gemini-2.5-pro';
    }

    const response = await client.models.generateContent({
      model: model,
      contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
      config
    });
    
    res.json({ text: response.text || '' });
  } catch (err: any) {
    console.error('Gemini Chat Error:', err);
    res.status(500).json({ error: err.message || 'AI request failed' });
  }
});
