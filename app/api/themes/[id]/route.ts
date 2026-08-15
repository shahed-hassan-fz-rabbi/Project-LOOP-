import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;

    const theme = await prisma.theme.findUnique({
      where: { id: params.id },
      include: {
        feedbackThemes: {
          include: {
            feedback: true,
          },
        },
      },
    });

    if (!theme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    // Tenant isolation
    if (theme.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const feedbackItems = theme.feedbackThemes.map((ft) => ({
      id: ft.feedback.id,
      content: ft.feedback.content,
      channel: ft.feedback.channel,
      sentiment: ft.feedback.sentiment,
      status: ft.feedback.status,
      customerLabel: ft.feedback.customerLabel,
      createdAt: ft.feedback.createdAt,
      confidence: ft.confidence,
    }));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const timelineByDate: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      timelineByDate[dateStr] = 0;
    }

    theme.feedbackThemes.forEach((ft) => {
      const dateStr = new Date(ft.feedback.createdAt).toISOString().split("T")[0];
      if (timelineByDate[dateStr] !== undefined) {
        timelineByDate[dateStr] += 1;
      }
    });

    const timelineData = Object.entries(timelineByDate).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({
      theme: {
        id: theme.id,
        name: theme.name,
        description: theme.description,
        color: theme.color,
        totalCount: feedbackItems.length,
      },
      feedback: feedbackItems,
      timeline: timelineData,
    });
  } catch (error: any) {
    console.error("Get theme drilldown error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}