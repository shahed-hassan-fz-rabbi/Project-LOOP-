import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
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

    const prompt = `You are a Principal Product Intelligence Specialist.
Generate a structured, executive Voice-of-Customer report based on the provided metrics.

Period: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}

METRICS:
- Total Feedback: ${stats.totalFeedback}
- Positive: ${stats.sentimentBreakdown.positive}, Neutral: ${stats.sentimentBreakdown.neutral}, Negative: ${stats.sentimentBreakdown.negative}
- Shift in Negative Sentiment: ${sentimentShift > 0 ? "+" : ""}${Math.round(sentimentShift)}%
- Top Channels: ${Object.entries(stats.channels).map(([c, count]) => `${c}: ${count}`).join(", ")}
- Top Themes: ${Object.entries(stats.topThemes).map(([t, count]) => `${t}: ${count}`).join(", ")}
- Example Quotes:
${stats.topQuotes.map((q, i) => `  ${i + 1}. "${q}"`).join("\n")}

Generate the report in these structured sections with clean paragraphs:
### Executive Summary
### Sentiment & Trend Dynamics
### Top Critical Themes & Friction Points
### Strategic Recommendations`;

    let narrative = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      narrative = response.text || "";
    } catch {
      narrative = "Executive report generated based on workspace metrics.";
    }

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
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}