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

    const userRole = (session.user as any).role;
    const workspaceId = (session.user as any).workspaceId;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const unclassified = await prisma.feedback.findMany({
      where: {
        workspaceId,
        sentiment: "NEU",
      },
      take: 40,
    });

    if (unclassified.length === 0) {
      return NextResponse.json({ message: "No unclassified feedback found", count: 0 });
    }

    const existingThemes = await prisma.theme.findMany({
      where: { workspaceId },
      select: { name: true },
    });
    const themeNames = existingThemes.map((t) => t.name);

    let processed = 0;

    for (const item of unclassified) {
      const classification = await classifyFeedbackWithRetry(item.content, themeNames);
      if (classification) {
        await prisma.feedback.update({
          where: { id: item.id },
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

          await prisma.feedbackTheme.upsert({
            where: {
              feedbackId_themeId: {
                feedbackId: item.id,
                themeId: theme.id,
              },
            },
            update: { confidence: 0.9 },
            create: {
              feedbackId: item.id,
              themeId: theme.id,
              confidence: 0.9,
            },
          });
        }
        processed++;
      }
      // Rate limiting delay
      await new Promise((r) => setTimeout(r, 400));
    }

    return NextResponse.json({
      message: `Successfully classified ${processed} items`,
      totalProcessed: processed,
    });
  } catch (error: any) {
    console.error("Bulk classify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}