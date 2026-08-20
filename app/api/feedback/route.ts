import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const channel = searchParams.get("channel") || "";
    const sentiment = searchParams.get("sentiment") || "";
    const status = searchParams.get("status") || "";

    const whereClause: any = {
      workspaceId: user.workspaceId,
    };

    if (search) {
      whereClause.content = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (channel && channel !== "All Channels") {
      whereClause.channel = channel;
    }

    if (sentiment && sentiment !== "All Sentiments") {
      whereClause.sentiment = sentiment;
    }

    if (status && status !== "All Statuses") {
      whereClause.status = status;
    }

    const feedbacks = await prisma.feedback.findMany({
      where: whereClause,
      include: {
        feedbackThemes: {
          include: {
            theme: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      feedbacks,
      total: feedbacks.length,
    });
  } catch (error: any) {
    console.error("Feedback API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const body = await req.json();
    const { content, channel = "Manual Intake", sentiment = "NEU", customerLabel = "Direct User" } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const newFeedback = await prisma.feedback.create({
      data: {
        content,
        channel,
        customerLabel,
        sentiment,
        sentimentScore: sentiment === "POS" ? 0.8 : sentiment === "NEG" ? -0.8 : 0.0,
        status: "NEW",
        workspaceId: user.workspaceId,
      },
    });

    return NextResponse.json({ success: true, feedback: newFeedback });
  } catch (error: any) {
    console.error("Create Feedback Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create feedback" },
      { status: 500 }
    );
  }
}