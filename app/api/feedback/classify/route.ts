import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { classifyFeedbackWithRetry } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    const body = await request.json();
    const { feedbackId } = body;

    if (!feedbackId) {
      return NextResponse.json({ error: "feedbackId is required" }, { status: 400 });
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
    });

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    // Tenant isolation
    if (feedback.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existingThemes = await prisma.theme.findMany({
      where: { workspaceId },
      select: { name: true },
    });
    const existingThemeNames = existingThemes.map((t) => t.name);

    const classification = await classifyFeedbackWithRetry(
      feedback.content,
      existingThemeNames
    );

    if (!classification) {
      return NextResponse.json({ error: "Classification failed" }, { status: 500 });
    }

    const updated = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        sentiment: classification.sentiment,
        sentimentScore: classification.sentimentScore,
      },
    });

    // Reset old theme mappings
    await prisma.feedbackTheme.deleteMany({
      where: { feedbackId },
    });

    for (const themeName of classification.themes) {
      let theme = await prisma.theme.findFirst({
        where: { workspaceId, name: themeName },
      });

      if (!theme) {
        theme = await prisma.theme.create({
          data: {
            name: themeName,
            description: `Auto-generated: ${classification.rationale}`,
            workspaceId,
          },
        });
      }

      await prisma.feedbackTheme.create({
        data: {
          feedbackId,
          themeId: theme.id,
          confidence: 0.9,
        },
      });
    }

    return NextResponse.json({
      message: "Feedback classified successfully",
      feedback: updated,
      classification,
    });
  } catch (error: any) {
    console.error("Classify route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}