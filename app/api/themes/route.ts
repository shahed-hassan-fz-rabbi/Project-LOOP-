import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const daysParam = parseInt(searchParams.get("days") || "30", 10);
    const days = isNaN(daysParam) ? 30 : daysParam;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: session.user.id || "" },
          { email: session.user.email || "" },
        ],
      },
      select: { workspaceId: true },
    });

    if (!user?.workspaceId) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const workspaceId = user.workspaceId;
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(now.getDate() - 14);

    // Fetch themes with feedbacks
    const themes = await prisma.theme.findMany({
      where: { workspaceId },
      include: {
        feedbackThemes: {
          include: {
            feedback: true,
          },
        },
      },
    });

    // Format theme calculations
    const formattedThemes = themes.map((theme) => {
      const allLinked = theme.feedbackThemes
        .map((ft) => ft.feedback)
        .filter((f): f is NonNullable<typeof f> => f !== null);

      const periodFeedbacks = allLinked.filter((f) => f.createdAt >= startDate);
      const totalCount = periodFeedbacks.length;

      const lastWeekCount = allLinked.filter((f) => f.createdAt >= sevenDaysAgo).length;
      const prevWeekCount = allLinked.filter(
        (f) => f.createdAt >= fourteenDaysAgo && f.createdAt < sevenDaysAgo
      ).length;

      let growth = 0;
      if (prevWeekCount === 0 && lastWeekCount > 0) {
        growth = 100;
      } else if (prevWeekCount > 0) {
        growth = Math.round(((lastWeekCount - prevWeekCount) / prevWeekCount) * 100);
      }

      const isSpiking = growth >= 30 || (lastWeekCount >= 4 && growth > 0);

      const posCount = periodFeedbacks.filter((f) => f.sentiment === "POS").length;
      const neuCount = periodFeedbacks.filter((f) => f.sentiment === "NEU").length;
      const negCount = periodFeedbacks.filter((f) => f.sentiment === "NEG").length;

      return {
        id: theme.id,
        name: theme.name,
        description: theme.description,
        color: theme.color || "#0284c7",
        totalCount,
        lastWeekCount,
        prevWeekCount,
        growth,
        isSpiking,
        sentimentCounts: {
          POS: posCount,
          NEU: neuCount,
          NEG: negCount,
        },
      };
    });

    formattedThemes.sort((a, b) => b.totalCount - a.totalCount);

    // Multi-theme comparative timeline for top 4 themes
    const topThemes = formattedThemes.slice(0, 4);
    const timelineMap = new Map<string, Record<string, any>>();

    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const entry: Record<string, any> = { date: dateStr };
      topThemes.forEach((t) => {
        entry[t.name] = 0;
      });
      timelineMap.set(dateStr, entry);
    }

    themes.forEach((theme) => {
      const isTop = topThemes.find((t) => t.id === theme.id);
      if (isTop) {
        theme.feedbackThemes.forEach((ft) => {
          if (ft.feedback && ft.feedback.createdAt >= startDate) {
            const dStr = ft.feedback.createdAt.toISOString().split("T")[0];
            const point = timelineMap.get(dStr);
            if (point) {
              point[theme.name] = (point[theme.name] || 0) + 1;
            }
          }
        });
      }
    });

    const comparativeTimeline = Array.from(timelineMap.values());

    return NextResponse.json({
      themes: formattedThemes,
      comparativeTimeline,
      topThemeNames: topThemes.map((t) => ({ name: t.name, color: t.color })),
    });
  } catch (error: any) {
    console.error("Themes API Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to load themes" }, { status: 500 });
  }
}