import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { classifyFeedbackWithRetry } from "@/lib/ai";
import { generateEmbedding } from "@/lib/embeddings";

const createFeedbackSchema = z.object({
  content: z.string().min(5, "Feedback must be at least 5 characters"),
  channel: z.string().min(1, "Channel is required"),
  customerLabel: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const workspaceId = (session.user as any).workspaceId;

    if (!["ADMIN", "ANALYST"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createFeedbackSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { content, channel, customerLabel } = validation.data;

    let feedback = await prisma.feedback.create({
      data: {
        content,
        channel,
        customerLabel: customerLabel || "Anonymous",
        workspaceId,
        status: "NEW",
        sentiment: "NEU",
        sentimentScore: 0,
      },
    });

    // 1. Auto-classify with Claude AI
    try {
      const existingThemes = await prisma.theme.findMany({
        where: { workspaceId },
        select: { name: true },
      });
      const existingThemeNames = existingThemes.map((t) => t.name);

      const classification = await classifyFeedbackWithRetry(
        content,
        existingThemeNames
      );

      if (classification) {
        feedback = await prisma.feedback.update({
          where: { id: feedback.id },
          data: {
            sentiment: classification.sentiment,
            sentimentScore: classification.sentimentScore,
          },
        });

        for (const themeName of classification.themes) {
          let theme = await prisma.theme.findFirst({
            where: { workspaceId, name: themeName },
          });

          if (!theme) {
            theme = await prisma.theme.create({
              data: {
                name: themeName,
                description: `Auto-generated theme: ${classification.featureArea}`,
                workspaceId,
              },
            });
          }

          await prisma.feedbackTheme.create({
            data: {
              feedbackId: feedback.id,
              themeId: theme.id,
              confidence: 0.9,
            },
          });
        }
      }
    } catch (classifyError) {
      console.error("Background AI classification failed:", classifyError);
    }

    // 2. Generate Semantic Vector Embedding
    try {
      const embedding = await generateEmbedding(content);

      await prisma.embedding.create({
        data: {
          feedbackId: feedback.id,
          vector: JSON.stringify(embedding),
        },
      });
    } catch (embeddingError) {
      console.error("Embedding generation failed:", embeddingError);
    }

    return NextResponse.json(
      { message: "Feedback created successfully", feedback },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const channel = url.searchParams.get("channel");
    const sentiment = url.searchParams.get("sentiment");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    const where: any = { workspaceId };

    if (channel) where.channel = channel;
    if (sentiment) where.sentiment = sentiment;
    if (status) where.status = status;
    if (search) {
      where.content = { contains: search, mode: "insensitive" };
    }

    const total = await prisma.feedback.count({ where });

    const feedback = await prisma.feedback.findMany({
      where,
      include: {
        feedbackThemes: {
          include: { theme: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      feedback,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("List feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}