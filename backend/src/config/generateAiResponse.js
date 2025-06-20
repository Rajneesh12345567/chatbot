import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API });

async function main(promptMessage) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: promptMessage,
  });
  return response.text;
  
}

export default main;
