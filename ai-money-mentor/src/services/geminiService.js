import axios from 'axios';

// Try multiple models in order until one works
const MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
];

async function tryModel(model, body) {
  const API_KEY = import.meta.env.VITE_GEMINI_KEY;
  if (!API_KEY) throw new Error('VITE_GEMINI_KEY is not set in .env');
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
  const response = await axios.post(URL, body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });
  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No text returned from Gemini');
  return text;
}

export async function askGemini(prompt, systemPrompt = '') {
  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: systemPrompt
              ? `System Instruction: ${systemPrompt}\n\nUser Prompt: ${prompt}`
              : prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  let lastError;
  for (const model of MODELS) {
    try {
      const text = await tryModel(model, body);
      return text;
    } catch (err) {
      console.warn(`Gemini model ${model} failed:`, err?.response?.data?.error?.message || err.message);
      lastError = err;
    }
  }
  console.error('All Gemini models failed. Last error:', lastError);
  throw lastError;
}

export async function askGeminiJSON(prompt, systemPrompt = '') {
  const text = await askGemini(prompt, systemPrompt);
  try {
    let clean = text.trim();
    // Strip any markdown code fences
    clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error('Failed to parse JSON from AI response. Raw text:', text);
    throw new Error('Invalid JSON format from AI');
  }
}
