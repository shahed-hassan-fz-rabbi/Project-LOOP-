import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateEmbedding, cosineSimilarity } from "@/lib/embeddings";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { query, topK = 5 } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const workspaceId = (session.user as any).workspaceId;

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // Get all feedback with embeddings in workspace
    const feedback = await prisma.feedback.findMany({
      where: { workspaceId },
      include: {
        embedding: true,
        feedbackThemes: {
          include: { theme: true },
        },
      },
    });

    // Calculate similarity scores
    const scored = feedback
      .filter((f) => f.embedding) // Only items with embeddings
      .map((f) => {
        const feedbackVector = JSON.parse(f.embedding!.vector);
        const similarity = cosineSimilarity(queryEmbedding, feedbackVector);

        return {
          id: f.id,
          content: f.content,
          channel: f.channel,
          sentiment: f.sentiment,
          customerLabel: f.customerLabel,
          createdAt: f.createdAt,
          themes: f.feedbackThemes.map((ft) => ft.theme.name),
          similarity,
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return NextResponse.json({
      query,
      results: scored,
    });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}