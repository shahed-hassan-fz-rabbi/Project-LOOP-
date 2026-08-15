import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import { generateEmbedding, cosineSimilarity } from "@/lib/embeddings";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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

    // 1. Fetch workspace feedback with theme tags
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

    // 2. Rank feedback using similarity scoring
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
    const topEvidence = scored.slice(0, 6);

    // 3. Grounded Context Formation
    const context = topEvidence
      .map(
        (f, idx) =>
          `[Feedback ${idx + 1}] (Channel: ${f.channel} | Sentiment: ${f.sentiment}): "${f.content}"`
      )
      .join("\n\n");

    const prompt = `You are "Ask LOOP", an executive AI Product Intelligence Analyst.
Answer the user's question accurately and objectively using ONLY the retrieved customer feedback below.

Retrieved Customer Feedback:
${context}

User Question: "${question}"

Guidelines:
1. Ground every statement in the provided feedback.
2. Quote or reference specific user complaints/praises where applicable.
3. Keep the response concise, executive, and structured (2 to 4 sentences or concise bullets).
4. If the feedback is insufficient to answer the question, state: "The provided feedback does not contain enough information to answer this question."`;

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    let answer = "";
    for (const block of message.content) {
      if (block.type === "text") {
        answer += block.text;
      }
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