import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // RBAC check
    if (!["ADMIN", "ANALYST"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Read CSV
    const text = await file.text();
    const lines = text.split("\n");

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV file is empty" },
        { status: 400 }
      );
    }

    // Parse header
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const contentIndex = header.indexOf("content");
    const channelIndex = header.indexOf("channel");
    const customerLabelIndex = header.indexOf("customer_label");

    if (contentIndex === -1 || channelIndex === -1) {
      return NextResponse.json(
        { error: "CSV must have 'content' and 'channel' columns" },
        { status: 400 }
      );
    }

    // Parse rows
    const workspaceId = session.user.workspaceId;
    let imported = 0;
    let failed = 0;
    const errors: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines

      try {
        const values = lines[i].split(",").map((v) => v.trim());

        const content = values[contentIndex];
        const channel = values[channelIndex];
        const customerLabel =
          customerLabelIndex >= 0
            ? values[customerLabelIndex]
            : "Anonymous";

        if (!content || !channel) {
          failed++;
          errors.push({
            row: i + 1,
            error: "Missing content or channel",
          });
          continue;
        }

        // Create feedback
        await prisma.feedback.create({
          data: {
            content,
            channel,
            customerLabel: customerLabel || "Anonymous",
            workspaceId,
            status: "NEW",
          },
        });

        imported++;
      } catch (err: any) {
        failed++;
        errors.push({
          row: i + 1,
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      message: "CSV import completed",
      imported,
      failed,
      errors: errors.slice(0, 10), // Return first 10 errors
    });
  } catch (error: any) {
    console.error("CSV upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}