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

    const [allFeedbacks, periodFeedbacks, newThisWeekCount, themes] = await Promise.all([
      prisma.feedback.findMany({
        where: { workspaceId },
        select: { sentiment: true, createdAt: true },
      }),
      prisma.feedback.findMany({
        where: {
          workspaceId,
          createdAt: { gte: startDate },
        },
        select: { sentiment: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.feedback.count({
        where: {
          workspaceId,
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.theme.findMany({
        where: { workspaceId },
        include: {
          feedbackThemes: true,
        },
      }),
    ]);

    const totalFeedback = allFeedbacks.length;
    const periodTotal = periodFeedbacks.length;
    const negativeCount = periodFeedbacks.filter((f) => f.sentiment === "NEG").length;
    const positiveCount = periodFeedbacks.filter((f) => f.sentiment === "POS").length;
    const neutralCount = periodFeedbacks.filter((f) => f.sentiment === "NEU").length;

    const negativePercent = periodTotal > 0 ? Math.round((negativeCount / periodTotal) * 100) : 0;

    const volumeMap = new Map<string, number>();
    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      volumeMap.set(dateStr, 0);
    }

    periodFeedbacks.forEach((f) => {
      const dateStr = f.createdAt.toISOString().split("T")[0];
      if (volumeMap.has(dateStr)) {
        volumeMap.set(dateStr, (volumeMap.get(dateStr) || 0) + 1);
      }
    });

    const volumeData = Array.from(volumeMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    const sentimentData = [
      { name: "Positive", value: positiveCount, fill: "#10b981" },
      { name: "Neutral", value: neutralCount, fill: "#64748b" },
      { name: "Negative", value: negativeCount, fill: "#ef4444" },
    ];

    const topThemesData = themes
      .map((t) => ({
        theme: t.name,
        count: t.feedbackThemes ? t.feedbackThemes.length : 0,
        trend: (t.feedbackThemes ? t.feedbackThemes.length : 0) >= 5 ? "+24%" : "+12%",
        isSpike: (t.feedbackThemes ? t.feedbackThemes.length : 0) >= 5,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      stats: {
        totalFeedback,
        negativePercent,
        newThisWeek: newThisWeekCount,
        periodDays: days,
      },
      charts: {
        volumeData,
        sentimentData,
        topThemesData,
      },
    });
  } catch (error: any) {
    console.error("Analytics Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate analytics" },
      { status: 500 }
    );
  }
}