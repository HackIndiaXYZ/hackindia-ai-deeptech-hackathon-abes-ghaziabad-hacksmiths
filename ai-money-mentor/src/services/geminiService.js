import axios from 'axios';

export async function askGemini(prompt, systemPrompt = "") {
  const API_KEY = process.env.REACT_APP_GEMINI_KEY;
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: systemPrompt ? `System Instruction: ${systemPrompt}\n\nUser Prompt: ${prompt}` : prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048
    }
  };

  let retries = 1;
  while (retries >= 0) {
    try {
      const response = await axios.post(URL, body, {
        headers: { "Content-Type": "application/json" }
      });
      
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("No text return from Gemini");
      
      return text;
    } catch (error) {
      if (retries === 0) {
        console.error("Gemini API Error:", error);
        throw error;
      }
      retries--;
    }
  }
}

export async function askGeminiJSON(prompt, systemPrompt = "") {
  const text = await askGemini(prompt, systemPrompt);
  try {
    let cleanText = text.trim();
    // Strip markdown fences
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.slice(0, -3);
      }
    } else if (cleanText.startsWith('```')) {
      const firstNewline = cleanText.indexOf('\n');
      cleanText = cleanText.substring(firstNewline + 1);
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.slice(0, -3);
      }
    }
    
    return JSON.parse(cleanText.trim());
  } catch (error) {
    console.error("Failed to parse JSON from AI response:", error);
    throw new Error("Invalid JSON format");
  }
}
