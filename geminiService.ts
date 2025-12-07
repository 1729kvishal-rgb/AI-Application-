import { GoogleGenAI, Type } from "@google/genai";
import { SecurityPlan } from "../types";

// Helper to remove data URL prefix for API
const cleanBase64 = (base64Data: string) => {
  return base64Data.split(',')[1];
};

export const analyzeHomeImages = async (base64Images: string[]): Promise<SecurityPlan> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare schema for structured JSON output
  const schema = {
    type: Type.OBJECT,
    properties: {
      vulnerabilities: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of identified security weaknesses based on the image (e.g., dark corners, glass doors).",
      },
      recommendations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the device (e.g., 'Outdoor Floodlight Camera')" },
            category: { type: Type.STRING, description: "Type of device" },
            description: { type: Type.STRING, description: "Brief tech specs or features" },
            reasoning: { type: Type.STRING, description: "Why this device is needed for this specific home" },
            estimatedCost: { type: Type.NUMBER, description: "Estimated average market price in USD" },
            priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
          },
          required: ["name", "category", "description", "reasoning", "estimatedCost", "priority"],
        },
      },
      totalEstimatedCostMin: { type: Type.NUMBER, description: "Minimum total budget estimate" },
      totalEstimatedCostMax: { type: Type.NUMBER, description: "Maximum total budget estimate" },
      executiveSummary: { type: Type.STRING, description: "A paragraph summarizing the security strategy." },
      ecosystemBenefits: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of benefits of this integrated system.",
      },
    },
    required: ["vulnerabilities", "recommendations", "totalEstimatedCostMin", "totalEstimatedCostMax", "executiveSummary", "ecosystemBenefits"],
  };

  // Prepare content parts
  const parts = base64Images.map((img) => ({
    inlineData: {
      data: cleanBase64(img),
      mimeType: "image/jpeg", // Assuming JPEG/PNG, API handles standard types well
    },
  }));

  parts.push({
    // @ts-ignore - 'text' is valid here but TS might be strict on union types in the loop context
    text: `You are a world-class home security engineer and architect. 
    Analyze the provided images of a home. 
    Identify potential security risks (entry points, blind spots, lighting issues).
    Design a complete security ecosystem for this user.
    Provide a Bill of Materials (BOM) with realistic market prices in USD.
    Return the response in strict JSON format matching the schema.`
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.4, // Lower temperature for more factual/consistent pricing
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as SecurityPlan;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};