import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: {
    id: string;
  };
}

// Update feedback status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!["NEW", "REVIEWED", "ACTIONED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Check if feedback belongs to user's workspace
    const feedback = await prisma.feedback.findUnique({
      where: { id: params.id },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    // ✅ CRITICAL: Tenant isolation check
    if (feedback.workspaceId !== session.user.workspaceId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Check RBAC
    if (!["ADMIN", "ANALYST"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Update
    const updated = await prisma.feedback.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({
      message: "Feedback updated",
      feedback: updated,
    });
  } catch (error: any) {
    console.error("Update feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete feedback
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id: params.id },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    // ✅ Tenant isolation
    if (feedback.workspaceId !== session.user.workspaceId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.feedback.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Feedback deleted",
    });
  } catch (error: any) {
    console.error("Delete feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}