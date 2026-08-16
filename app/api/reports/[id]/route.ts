import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }> | { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const workspaceId = (session.user as any).workspaceId;

    const report = await prisma.report.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const content = JSON.parse(report.contentJson);

    return NextResponse.json({
      report: {
        id: report.id,
        title: report.title,
        periodStart: report.periodStart,
        periodEnd: report.periodEnd,
        createdAt: report.createdAt,
      },
      content,
    });
  } catch (error: any) {
    console.error("Get report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const resolvedParams = await Promise.resolve(params);
    const workspaceId = (session.user as any).workspaceId;

    const report = await prisma.report.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!report || report.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    await prisma.report.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ message: "Report deleted successfully" });
  } catch (error: any) {
    console.error("Delete report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}