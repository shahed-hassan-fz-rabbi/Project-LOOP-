import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateEmbedding } from "@/lib/embeddings";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const workspaceId = (session.user as any).workspaceId;

    // RBAC Check: Only ADMIN & ANALYST can upload CSV
    if (!["ADMIN", "ANALYST"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read CSV content
    const text = await file.text();
    const lines = text.split("\n");

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    }

    // Parse header row
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

    let imported = 0;
    let failed = 0;
    const errors: any[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      try {
        const values = lines[i].split(",").map((v) => v.trim());

        const content = values[contentIndex];
        const channel = values[channelIndex];
        const customerLabel =
          customerLabelIndex >= 0 ? values[customerLabelIndex] : "Anonymous";

        if (!content || !channel) {
          failed++;
          errors.push({
            row: i + 1,
            error: "Missing content or channel",
          });
          continue;
        }

        // 1. Create feedback record
        const feedback = await prisma.feedback.create({
          data: {
            content,
            channel,
            customerLabel: customerLabel || "Anonymous",
            workspaceId,
            status: "NEW",
            sentiment: "NEU",
            sentimentScore: 0,
          },
        });

        // 2. Generate vector embedding
        try {
          const embedding = await generateEmbedding(content);
          await prisma.embedding.create({
            data: {
              feedbackId: feedback.id,
              vector: JSON.stringify(embedding),
            },
          });
        } catch (embedErr) {
          console.error(`Embedding generation failed for row ${i + 1}`);
        }

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
      errors: errors.slice(0, 10),
    });
  } catch (error: any) {
    console.error("CSV upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}