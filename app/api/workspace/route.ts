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
      include: {
        workspace: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
              },
            },
            _count: {
              select: {
                feedback: true,
                reports: true,
                themes: true,
              },
            },
          },
        },
      },
    });

    if (!user?.workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const workspaceId = user.workspace.id;

    const unclassifiedCount = await prisma.feedback.count({
      where: {
        workspaceId,
        sentiment: "NEU",
        feedbackThemes: { none: {} },
      },
    });

    const processedCount = (user.workspace._count.feedback || 0) - unclassifiedCount;

    return NextResponse.json({
      workspace: user.workspace,
      currentUserRole: user.role,
      stats: {
        totalFeedback: user.workspace._count.feedback,
        processedFeedback: Math.max(0, processedCount),
        unclassifiedFeedback: Math.max(0, unclassifiedCount),
        totalThemes: user.workspace._count.themes,
        totalReports: user.workspace._count.reports,
      },
    });
  } catch (error: any) {
    console.error("Workspace GET Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch workspace details" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
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
    });

    if (!user?.workspaceId) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only workspace admins can update settings" }, { status: 403 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
    }

    const updated = await prisma.workspace.update({
      where: { id: user.workspaceId },
      data: { name: name.trim() },
    });

    return NextResponse.json({ success: true, workspace: updated });
  } catch (error: any) {
    console.error("Workspace PATCH Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update workspace" },
      { status: 500 }
    );
  }
}