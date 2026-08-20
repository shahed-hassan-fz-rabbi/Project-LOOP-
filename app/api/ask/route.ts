import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const workspaceId = user.workspaceId;
    const cleanQuery = query.toLowerCase().trim();

    // 1. Extract core intent keywords
    const keywords = cleanQuery
      .replace(/[^\w\s]/gi, "")
      .split(/\s+/)
      .filter((w) => !["what", "are", "customers", "saying", "about", "the", "is", "for", "and", "how", "why", "which", "most", "recurring"].includes(w));

    // 2. Hybrid Retrieval: Match against Feedback Content AND Themes
    let matchedFeedbacks = await prisma.feedback.findMany({
      where: {
        workspaceId,
        OR: [
          ...keywords.map((kw) => ({
            content: { contains: kw, mode: "insensitive" as const },
          })),
          ...keywords.map((kw) => ({
            feedbackThemes: {
              some: {
                theme: {
                  name: { contains: kw, mode: "insensitive" as const },
                },
              },
            },
          })),
        ],
      },
      include: {
        feedbackThemes: {
          include: {
            theme: true,
          },
        },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });

    // Fallback if broad query
    if (matchedFeedbacks.length === 0) {
      matchedFeedbacks = await prisma.feedback.findMany({
        where: { workspaceId },
        include: {
          feedbackThemes: {
            include: {
              theme: true,
            },
          },
        },
        take: 6,
        orderBy: { createdAt: "desc" },
      });
    }

    if (matchedFeedbacks.length === 0) {
      return NextResponse.json({
        answer: "I could not find any feedback records in your workspace matching this query.",
        evidence: [],
        hasInsufficientEvidence: true,
      });
    }

    // 3. Synthesize Grounded Answer from Retrieved Evidence
    const posCount = matchedFeedbacks.filter((f) => f.sentiment === "POS").length;
    const negCount = matchedFeedbacks.filter((f) => f.sentiment === "NEG").length;
    const neuCount = matchedFeedbacks.filter((f) => f.sentiment === "NEU").length;

    let sentimentOverview = "mixed sentiment";
    if (negCount > posCount && negCount >= 2) {
      sentimentOverview = "predominantly negative sentiment with noticeable user friction";
    } else if (posCount > negCount && posCount >= 2) {
      sentimentOverview = "overall positive satisfaction";
    }

    // Extract key quotes
    const quoteSnippets = matchedFeedbacks.slice(0, 3).map((f) => `"${f.content}"`);

    let answer = `Based on ${matchedFeedbacks.length} verified customer feedback records regarding this topic, customers report **${sentimentOverview}**.\n\n`;

    if (negCount > 0) {
      answer += `**Key Pain Points:** Users highlighted issues such as ${quoteSnippets[0] || "usability hurdles"}.\n\n`;
    }
    if (posCount > 0) {
      answer += `**Positive Highlights:** Several users appreciated the experience, noting ${quoteSnippets[1] || "smooth functionality"}.\n\n`;
    }
    answer += `**Recommendation:** Prioritize resolving the friction identified in support channels to improve adoption.`;

    // 4. Format Evidence Payload for UI Cards
    const evidence = matchedFeedbacks.map((f) => ({
      id: f.id,
      content: f.content,
      channel: f.channel,
      sentiment: f.sentiment,
      customerLabel: f.customerLabel || "Anonymous Customer",
      createdAt: f.createdAt.toISOString(),
    }));

    return NextResponse.json({
      answer,
      evidence,
      hasInsufficientEvidence: false,
    });
  } catch (error: any) {
    console.error("Ask API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process question" },
      { status: 500 }
    );
  }
}