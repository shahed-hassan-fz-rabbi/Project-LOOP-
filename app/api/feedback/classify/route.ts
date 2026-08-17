import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { classifyFeedbackWithRetry } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const role = (session.user as any).role;
    const workspaceId = (session.user as any).workspaceId;

    if (!["ADMIN", "ANALYST"].includes(role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { feedbackId } = body;

    if (!feedbackId) {
      return NextResponse.json(
        { error: "feedbackId is required" },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
    });

    if (!feedback || feedback.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: "Feedback not found or forbidden" },
        { status: 404 }
      );
    }

    // Get existing themes
    const existingThemes = await prisma.theme.findMany({
      where: { workspaceId },
      select: { name: true },
    });

    const themeNames = existingThemes.map((t) => t.name);

    // Classify
    const classification = await classifyFeedbackWithRetry(
      feedback.content,
      themeNames
    );

    if (!classification) {
      return NextResponse.json(
        { error: "Failed to classify feedback after retries" },
        { status: 500 }
      );
    }

    // Update feedback
    const updatedFeedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        sentiment: classification.sentiment,
        sentimentScore: classification.sentimentScore,
      },
    });

    // Remove old theme assignments
    await prisma.feedbackTheme.deleteMany({
      where: { feedbackId },
    });

    // Assign new themes
    for (const themeName of classification.themes) {
      let theme = await prisma.theme.findFirst({
        where: { workspaceId, name: themeName },
      });

      if (!theme) {
        theme = await prisma.theme.create({
          data: {
            name: themeName,
            description: `Auto-generated: ${classification.featureArea}`,
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
      feedback: updatedFeedback,
      classification,
    });
  } catch (error: any) {
    console.error("Classification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}