import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createFeedbackSchema = z.object({
  content: z.string().min(10, "Feedback must be at least 10 characters"),
  channel: z.string().min(1, "Channel is required"),
  customerLabel: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check RBAC - only ADMIN and ANALYST can create feedback
    if (!["ADMIN", "ANALYST"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createFeedbackSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { content, channel, customerLabel } = validation.data;
    const workspaceId = session.user.workspaceId;

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        content,
        channel,
        customerLabel: customerLabel || "Anonymous",
        workspaceId,
        status: "NEW",
      },
    });

    return NextResponse.json(
      {
        message: "Feedback created successfully",
        feedback,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - List feedback with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workspaceId = session.user.workspaceId;

    // Query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const channel = url.searchParams.get("channel");
    const sentiment = url.searchParams.get("sentiment");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    // Build filters
    const where: any = {
      workspaceId, // ✅ CRITICAL: Always scope by workspace
    };

    if (channel) where.channel = channel;
    if (sentiment) where.sentiment = sentiment;
    if (status) where.status = status;
    if (search) {
      where.content = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Count total
    const total = await prisma.feedback.count({ where });

    // Fetch paginated results
    const feedback = await prisma.feedback.findMany({
      where,
      include: {
        feedbackThemes: {
          include: {
            theme: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      feedback,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("List feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}