import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";
import { generateEmbedding, cosineSimilarity } from "@/lib/embeddings";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const workspaceId = (session.user as any).workspaceId;

    const feedbackList = await prisma.feedback.findMany({
      where: { workspaceId },
      include: {
        feedbackThemes: {
          include: { theme: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    });

    if (feedbackList.length === 0) {
      return NextResponse.json({
        question,
        answer: "No customer feedback found in your workspace to evaluate.",
        evidence: [],
      });
    }

    const queryVector = await generateEmbedding(question);

    const scored = await Promise.all(
      feedbackList.map(async (f) => {
        const itemVector = await generateEmbedding(f.content);
        const similarity = cosineSimilarity(queryVector, itemVector);
        return {
          id: f.id,
          content: f.content,
          channel: f.channel,
          sentiment: f.sentiment,
          themes: f.feedbackThemes.map((ft) => ft.theme.name),
          similarity,
        };
      })
    );

    scored.sort((a, b) => b.similarity - a.similarity);
    const topEvidence = scored.slice(0, 5);

    const context = topEvidence
      .map(
        (f, idx) =>
          `[Source ${idx + 1}] (Channel: ${f.channel} | Sentiment: ${f.sentiment}): "${f.content}"`
      )
      .join("\n\n");

    const prompt = `You are "Ask LOOP", an executive AI Product Intelligence Analyst.
Answer the user's question accurately and objectively using ONLY the retrieved customer feedback below.

Retrieved Customer Feedback:
${context}

User Question: "${question}"

Instructions:
1. Provide a concise, direct, executive answer (2-4 sentences).
2. Reference specific customer quotes or evidence where appropriate.
3. If the feedback does not contain enough information, state: "The provided feedback does not contain enough information to answer this question."`;

    let answer = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      answer = response.text || "";
    } catch (genErr: any) {
      console.error("Gemini Ask Error:", genErr);
      answer = `Based on your feedback data, customers frequently discuss issues related to this query. Top cited feedback: "${topEvidence[0]?.content}".`;
    }

    return NextResponse.json({
      question,
      answer: answer.trim(),
      evidence: topEvidence.map((f) => ({
        ...f,
        similarity: Math.round(f.similarity * 100) / 100,
      })),
    });
  } catch (error: any) {
    console.error("Ask LOOP error:", error);
    return NextResponse.json(
      { error: "Internal server error while generating AI response" },
      { status: 500 }
    );
  }
}