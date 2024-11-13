import { AI_CONFIG } from '../ai-config';

export async function queryXAI(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${AI_CONFIG.xai.endpoint}/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.xai.apiKey}`
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      throw new Error('xAI API request failed');
    }

    const data = await response.json();
    return data.choices[0].text;
  } catch (error) {
    throw new Error('xAI service unavailable');
  }
}