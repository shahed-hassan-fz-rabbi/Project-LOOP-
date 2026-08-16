import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "dummy-key",
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
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "dummy-key") {
      throw new Error("Missing ANTHROPIC_API_KEY");
    }

    const prompt = `You are a customer feedback classifier. Analyze this feedback and output JSON only.

Feedback: "${content}"
Existing Themes in Workspace: ${JSON.stringify(existingThemes)}

Output Format (strict JSON only):
{
  "sentiment": "POS" | "NEU" | "NEG",
  "sentimentScore": <number between -1.0 and 1.0>,
  "themes": ["Theme1", "Theme2"],
  "featureArea": "Short area name"
}`;

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "{}";
    
    const parsed = JSON.parse(responseText.trim());
    return parsed;
  } catch (error: any) {
    console.error("AI Classification Error (Using Rule-based Fallback):", error.message);
    
    // Rule-based Fallback when API key is unauthenticated
    const lower = content.toLowerCase();
    const isNeg = lower.includes("slow") || lower.includes("bug") || lower.includes("crash") || lower.includes("confusing") || lower.includes("fail") || lower.includes("bad");
    const isPos = lower.includes("love") || lower.includes("great") || lower.includes("fast") || lower.includes("awesome") || lower.includes("good") || lower.includes("helped");

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