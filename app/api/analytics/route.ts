import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;

    // Scoped by authenticated tenant workspace
    const feedback = await prisma.feedback.findMany({
      where: { workspaceId },
      include: {
        feedbackThemes: {
          include: {
            theme: true,
          },
        },
      },
    });

    const totalFeedback = feedback.length;

    const negativeFeedback = feedback.filter((f) => f.sentiment === "NEG").length;
    const negativePercent =
      totalFeedback > 0 ? Math.round((negativeFeedback / totalFeedback) * 100) : 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newThisWeek = feedback.filter(
      (f) => new Date(f.createdAt) >= oneWeekAgo
    ).length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const volumeByDate: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      volumeByDate[dateStr] = 0;
    }

    feedback.forEach((f) => {
      const dateStr = new Date(f.createdAt).toISOString().split("T")[0];
      if (volumeByDate[dateStr] !== undefined) {
        volumeByDate[dateStr] += 1;
      }
    });

    const volumeData = Object.entries(volumeByDate).map(([date, count]) => ({
      date,
      count,
    }));

    const sentimentCounts = {
      POS: feedback.filter((f) => f.sentiment === "POS").length,
      NEU: feedback.filter((f) => f.sentiment === "NEU").length,
      NEG: feedback.filter((f) => f.sentiment === "NEG").length,
    };

    const sentimentData = [
      { name: "Positive", value: sentimentCounts.POS, fill: "#22c55e" },
      { name: "Neutral", value: sentimentCounts.NEU, fill: "#64748b" },
      { name: "Negative", value: sentimentCounts.NEG, fill: "#ef4444" },
    ];

    const themeCounts: Record<string, number> = {};
    feedback.forEach((f) => {
      f.feedbackThemes.forEach((ft) => {
        themeCounts[ft.theme.name] = (themeCounts[ft.theme.name] || 0) + 1;
      });
    });

    const topThemesData = Object.entries(themeCounts)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      stats: {
        totalFeedback,
        negativePercent,
        newThisWeek,
      },
      charts: {
        volumeData,
        sentimentData,
        topThemesData,
      },
    });
  } catch (error: any) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}