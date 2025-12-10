
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const getMarketInsights = async (): Promise<string> => {
  if (!API_KEY) {
    console.warn("Gemini API Key is missing.");
    return "Market insights are currently unavailable. Please check back later.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Provide a brief, professional summary of the Indian Stock Market (Nifty/Sensex) and global sectors relevant to Indian investors (Tech/Energy). Keep it under 100 words. Focus on opportunities. Do not use markdown formatting, bold text, or asterisks.",
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    let text = response.text || "No insights available at this time.";
    return text.replace(/[\*#_]/g, '').trim();
  } catch (error) {
    console.error("Error fetching market insights:", error);
    return "Unable to load market insights. Please try again later.";
  }
};
