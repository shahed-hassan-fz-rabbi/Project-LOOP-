import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const theme = await prisma.theme.findUnique({
      where: { id },
      include: {
        feedbackThemes: {
          include: {
            feedback: true,
          },
          orderBy: {
            feedback: {
              createdAt: "desc",
            },
          },
        },
      },
    });

    if (!theme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    const linkedFeedbacks = theme.feedbackThemes
      .map((ft) => ft.feedback)
      .filter((f): f is NonNullable<typeof f> => f !== null);

    // 30 Days daily volume timeline for this specific theme
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const timelineMap = new Map<string, number>();
    for (let i = 0; i <= 30; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      timelineMap.set(d.toISOString().split("T")[0], 0);
    }

    linkedFeedbacks.forEach((f) => {
      if (f.createdAt >= startDate) {
        const dStr = f.createdAt.toISOString().split("T")[0];
        if (timelineMap.has(dStr)) {
          timelineMap.set(dStr, (timelineMap.get(dStr) || 0) + 1);
        }
      }
    });

    const timeline = Array.from(timelineMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({
      theme: {
        id: theme.id,
        name: theme.name,
        description: theme.description,
        color: theme.color || "#0284c7",
        totalCount: linkedFeedbacks.length,
      },
      feedback: linkedFeedbacks,
      timeline,
    });
  } catch (error: any) {
    console.error("Theme Detail Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to load theme details" }, { status: 500 });
  }
}