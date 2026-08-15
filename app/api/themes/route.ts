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

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const themeData = themes.map((theme) => {
      const feedbackItems = theme.feedbackThemes.map((ft) => ft.feedback);
      const totalCount = feedbackItems.length;

      const sentimentCounts = {
        POS: feedbackItems.filter((f) => f.sentiment === "POS").length,
        NEU: feedbackItems.filter((f) => f.sentiment === "NEU").length,
        NEG: feedbackItems.filter((f) => f.sentiment === "NEG").length,
      };

      const lastWeekCount = feedbackItems.filter(
        (f) => new Date(f.createdAt) >= oneWeekAgo
      ).length;

      const prevWeekCount = feedbackItems.filter(
        (f) =>
          new Date(f.createdAt) >= twoWeeksAgo &&
          new Date(f.createdAt) < oneWeekAgo
      ).length;

      const growth =
        prevWeekCount > 0
          ? Math.round(((lastWeekCount - prevWeekCount) / prevWeekCount) * 100)
          : lastWeekCount > 0
          ? 100
          : 0;

      return {
        id: theme.id,
        name: theme.name,
        description: theme.description,
        color: theme.color,
        totalCount,
        lastWeekCount,
        prevWeekCount,
        growth,
        sentimentCounts,
        isSpiking: growth >= 50 && lastWeekCount >= 2,
      };
    });

    themeData.sort((a, b) => b.totalCount - a.totalCount);

    return NextResponse.json({ themes: themeData });
  } catch (error: any) {
    console.error("Get themes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json({ error: "Theme name is required" }, { status: 400 });
    }

    const theme = await prisma.theme.create({
      data: {
        name,
        description: description || "",
        color: color || "#3b82f6",
        workspaceId,
      },
    });

    return NextResponse.json({ theme }, { status: 201 });
  } catch (error: any) {
    console.error("Create theme error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}