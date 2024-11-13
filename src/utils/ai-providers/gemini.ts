import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG } from '../ai-config';

const genAI = new GoogleGenerativeAI(AI_CONFIG.gemini.apiKey);

export async function queryGemini(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: AI_CONFIG.gemini.model });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error('Gemini service unavailable');
  }
}