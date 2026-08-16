import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export interface ClassificationResult {
  sentiment: "POS" | "NEU" | "NEG";
  sentimentScore: number;
  themes: string[];
  featureArea: string;
}

export async function classifyFeedback(
  content: string,
  existingThemes: string[] = []
): Promise<ClassificationResult | null> {
  try {
    const prompt = `You are a customer feedback classifier. Analyze this feedback and output strict JSON only.

Feedback: "${content}"
Existing Themes in Workspace: ${JSON.stringify(existingThemes)}

Output JSON Format:
{
  "sentiment": "POS" | "NEU" | "NEG",
  "sentimentScore": <number between -1.0 and 1.0>,
  "themes": ["Theme1", "Theme2"],
  "featureArea": "Short area name"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text.trim());
  } catch (error: any) {
    console.error("Gemini Classification Error:", error.message);
    const lower = content.toLowerCase();
    const isNeg = lower.includes("slow") || lower.includes("bug") || lower.includes("crash") || lower.includes("confusing");
    const isPos = lower.includes("love") || lower.includes("great") || lower.includes("fast") || lower.includes("awesome");

    return {
      sentiment: isNeg ? "NEG" : isPos ? "POS" : "NEU",
      sentimentScore: isNeg ? -0.8 : isPos ? 0.8 : 0,
      themes: existingThemes.length > 0 ? [existingThemes[0]] : ["General"],
      featureArea: "General",
    };
  }
}

export async function classifyFeedbackWithRetry(
  content: string,
  existingThemes: string[] = []
): Promise<ClassificationResult | null> {
  return await classifyFeedback(content, existingThemes);
}