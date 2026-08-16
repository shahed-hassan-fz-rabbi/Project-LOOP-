import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { periodStart, periodEnd, title } = body;

    if (!periodStart || !periodEnd) {
      return NextResponse.json(
        { error: "Period start and end are required" },
        { status: 400 }
      );
    }

    const workspaceId = (session.user as any).workspaceId;
    const userId = (session.user as any).id;

    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    // 1. Fetch Feedback in Target Period
    const feedback = await prisma.feedback.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        feedbackThemes: {
          include: { theme: true },
        },
      },
    });

    if (feedback.length === 0) {
      return NextResponse.json(
        { error: "No feedback found in the selected date period" },
        { status: 400 }
      );
    }

    // 2. Compute Statistics
    const stats = {
      totalFeedback: feedback.length,
      sentimentBreakdown: {
        positive: feedback.filter((f) => f.sentiment === "POS").length,
        neutral: feedback.filter((f) => f.sentiment === "NEU").length,
        negative: feedback.filter((f) => f.sentiment === "NEG").length,
      },
      channels: {} as Record<string, number>,
      topThemes: {} as Record<string, number>,
      topQuotes: [] as string[],
    };

    feedback.forEach((f) => {
      stats.channels[f.channel] = (stats.channels[f.channel] || 0) + 1;
      f.feedbackThemes.forEach((ft) => {
        stats.topThemes[ft.theme.name] = (stats.topThemes[ft.theme.name] || 0) + 1;
      });
    });

    // Sample representative quotes
    const positiveQuotes = feedback
      .filter((f) => f.sentiment === "POS")
      .slice(0, 2)
      .map((f) => f.content);

    const negativeQuotes = feedback
      .filter((f) => f.sentiment === "NEG")
      .slice(0, 2)
      .map((f) => f.content);

    const neutralQuotes = feedback
      .filter((f) => f.sentiment === "NEU")
      .slice(0, 1)
      .map((f) => f.content);

    stats.topQuotes = [...positiveQuotes, ...negativeQuotes, ...neutralQuotes];

    // 3. Compute Sentiment Shift vs Previous Window
    const periodLength = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodLength);
    const prevEnd = start;

    const prevFeedback = await prisma.feedback.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: prevStart,
          lte: prevEnd,
        },
      },
    });

    const prevNegativePercent =
      prevFeedback.length > 0
        ? (prevFeedback.filter((f) => f.sentiment === "NEG").length / prevFeedback.length) * 100
        : 0;

    const currNegativePercent =
      (stats.sentimentBreakdown.negative / stats.totalFeedback) * 100;

    const sentimentShift = currNegativePercent - prevNegativePercent;

    // 4. Generate Professional Synthesis with Claude
    const prompt = `You are a Principal Product Intelligence Specialist.
Generate a structured, executive Voice-of-Customer report based on the provided metrics.

Period: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}

METRICS SUMMARY:
- Total Customer Submissions: ${stats.totalFeedback}
- Sentiment Distribution: ${stats.sentimentBreakdown.positive} Positive (${Math.round((stats.sentimentBreakdown.positive / stats.totalFeedback) * 100)}%), ${stats.sentimentBreakdown.neutral} Neutral (${Math.round((stats.sentimentBreakdown.neutral / stats.totalFeedback) * 100)}%), ${stats.sentimentBreakdown.negative} Negative (${Math.round((stats.sentimentBreakdown.negative / stats.totalFeedback) * 100)}%)
- Negative Sentiment Shift: ${sentimentShift > 0 ? "+" : ""}${Math.round(sentimentShift)}% compared to prior window
- Dominant Channels: ${Object.entries(stats.channels).map(([c, count]) => `${c}: ${count}`).join(", ")}
- Top Recurring Themes: ${Object.entries(stats.topThemes).map(([t, count]) => `${t}: ${count}`).join(", ")}
- Direct Customer Quotes:
${stats.topQuotes.map((q, i) => `  ${i + 1}. "${q}"`).join("\n")}

Format the narrative under these clear sections (use concise, analytical paragraphs):
### Executive Summary
(2-3 high-level takeaway sentences)

### Sentiment & Trend Dynamics
(Analyze key shifts and user mood drivers)

### Top Critical Themes & Friction Points
(Detail recurring themes and what customers are asking for)

### Strategic Recommendations
(3-4 actionable bullet points for the product & engineering teams)`;

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    let narrative = "";
    for (const block of message.content) {
      if (block.type === "text") {
        narrative += block.text;
      }
    }

    // 5. Store Report in Database
    const report = await prisma.report.create({
      data: {
        title: title || `VoC Intelligence Report (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`,
        periodStart: start,
        periodEnd: end,
        contentJson: JSON.stringify({
          narrative: narrative.trim(),
          statistics: stats,
          sentimentShift: Math.round(sentimentShift * 10) / 10,
        }),
        workspaceId,
        generatedBy: userId,
      },
    });

    return NextResponse.json({
      message: "Report generated successfully",
      reportId: report.id,
      report,
    });
  } catch (error: any) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate report. Ensure Anthropic API key is valid." },
      { status: 500 }
    );
  }
}