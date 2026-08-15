import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const simulatedFeedback = [
  { content: "The onboarding flow is very confusing. I gave up after 15 minutes.", channel: "Support Ticket", sentiment: "NEG" },
  { content: "Love the new dashboard update! Performance is much better now.", channel: "App Store Review", sentiment: "POS" },
  { content: "SSO integration would be a game-changer for enterprise customers.", channel: "Sales Call Note", sentiment: "NEU" },
  { content: "Mobile app keeps crashing on iOS 17. Very frustrating.", channel: "App Store Review", sentiment: "NEG" },
  { content: "The export feature saves me hours every week. Great job!", channel: "Community Post", sentiment: "POS" },
  { content: "Billing page times out when trying to download invoices.", channel: "Support Ticket", sentiment: "NEG" },
  { content: "Your pricing is very competitive. Great value for money.", channel: "NPS Survey", sentiment: "POS" },
  { content: "Would love dark mode for late-night work sessions.", channel: "Feature Request", sentiment: "NEU" },
  { content: "Customer support resolved my issue in under an hour. Impressive!", channel: "NPS Survey", sentiment: "POS" },
  { content: "API documentation is incomplete and confusing.", channel: "Support Ticket", sentiment: "NEG" },
  { content: "The theme clustering feature is incredibly smart. Saves so much time!", channel: "Testimonial", sentiment: "POS" },
  { content: "Had to switch to a competitor because of reliability issues.", channel: "Churned Customer", sentiment: "NEG" },
  { content: "Integrations with Jira and Zendesk work seamlessly.", channel: "Case Study", sentiment: "POS" },
  { content: "Search functionality could be more powerful. Need boolean operators.", channel: "Feature Request", sentiment: "NEU" },
  { content: "The analytics dashboard gives us exactly what we need for decision-making.", channel: "Product Manager Feedback", sentiment: "POS" },
];

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

    const workspaceId = session.user.workspaceId;

    // Create simulated feedback items
    let created = 0;

    for (const item of simulatedFeedback) {
      await prisma.feedback.create({
        data: {
          content: item.content,
          channel: item.channel,
          customerLabel: `Customer ${Math.floor(Math.random() * 1000)}`,
          sentiment: item.sentiment as any,
          sentimentScore:
            item.sentiment === "POS"
              ? 0.7 + Math.random() * 0.3
              : item.sentiment === "NEG"
              ? -0.7 - Math.random() * 0.3
              : Math.random() * 0.4 - 0.2,
          workspaceId,
          status: "NEW",
        },
      });
      created++;
    }

    return NextResponse.json({
      message: "Simulated feedback imported",
      created,
    });
  } catch (error: any) {
    console.error("Simulate feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}