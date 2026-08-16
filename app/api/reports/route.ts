import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workspaceId = (session.user as any).workspaceId;

    // Get all reports for workspace
    const reports = await prisma.report.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      reports: reports.map((r) => ({
        id: r.id,
        title: r.title,
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
        createdAt: r.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Get reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}