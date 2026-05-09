import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function categorizeTransaction(description: string, categories: string[]) {
  if (!ai) {
    return "Uncategorized";
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Categorize the following transaction description into one of these categories: ${categories.join(', ')}.
      
      Description: "${description}"
      
      Return ONLY the matched category name from the list provided.`,
    });

    return response.text?.trim() || "Uncategorized";
  } catch (error) {
    console.error("Failed to categorize:", error);
    return "Uncategorized";
  }
}

export async function scanReceipt(base64Image: string, categories: string[]) {
  if (!ai) {
    throw new Error("Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.");
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `Carefully extract transaction information from this receipt image. 
            Instructional Guidelines:
            1. Amount: Locate the final 'Total', 'Grand Total', or 'Amount Due'. Explicitly ignore subtotal, sales tax, or tip lines unless they are the only amount.
            2. Date: Extract the transaction date. Normalize to YYYY-MM-DD. Use ${new Date().toISOString().split('T')[0]} if ambiguous.
            3. Merchant: Extract the primary business name.
            4. Category: Select the best match from this list: ${categories.join(', ')}.
            
            Return a precise JSON object.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            merchant: { type: Type.STRING },
            description: { type: Type.STRING },
            suggestedCategory: { type: Type.STRING },
          },
          required: ["amount", "date", "merchant", "description", "suggestedCategory"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("Failed to scan receipt:", error);
    throw error;
  }
}
