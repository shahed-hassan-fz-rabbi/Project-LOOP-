import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Zod Schema for Structured Output
const ClassificationSchema = z.object({
  sentiment: z.enum(["POS", "NEU", "NEG"]),
  sentimentScore: z.number().min(-1).max(1),
  themes: z.array(z.string()).min(1),
  featureArea: z.string(),
  rationale: z.string(),
});

export type ClassificationResult = z.infer<typeof ClassificationSchema>;

export async function classifyFeedback(
  content: string,
  existingThemes: string[] = []
): Promise<ClassificationResult | null> {
  try {
    const themesContext =
      existingThemes.length > 0
        ? `\n\nExisting themes in the workspace: ${existingThemes.join(", ")}\n\nPrefer reusing existing themes when appropriate. Suggest a new theme only if none fit.`
        : "";

    const prompt = `You are a corporate feedback intelligence classifier. Analyze this customer feedback and return ONLY a valid raw JSON object (no markdown, no backticks, no extra text).

Feedback: "${content}"${themesContext}

Required JSON format:
{
  "sentiment": "POS" | "NEU" | "NEG",
  "sentimentScore": -1.0 to 1.0,
  "themes": ["Theme1", "Theme2"],
  "featureArea": "Feature or Module Name",
  "rationale": "One short sentence explaining the sentiment and theme choice"
}`;

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    let rawText = "";
    for (const block of response.content) {
      if (block.type === "text") {
        rawText += block.text;
      }
    }

    const cleanedText = rawText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(cleanedText);
    const validated = ClassificationSchema.parse(parsed);

    return validated;
  } catch (error: any) {
    console.error("AI Classification Error:", error);
    return null;
  }
}

export async function classifyFeedbackWithRetry(
  content: string,
  existingThemes: string[] = [],
  retries: number = 1
): Promise<ClassificationResult | null> {
  let result = await classifyFeedback(content, existingThemes);
  if (!result && retries > 0) {
    console.log(`Retrying classification... (${retries} left)`);
    result = await classifyFeedbackWithRetry(content, existingThemes, retries - 1);
  }
  return result;
}