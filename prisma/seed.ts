import { PrismaClient, UserRole, Sentiment, FeedbackStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Realistic feedback data
const feedbackSamples = [
  // Onboarding
  { content: "Onboarding flow is confusing. Took 30 minutes to invite my first team member.", channel: "Support Ticket", sentiment: Sentiment.NEG, topic: "Onboarding" },
  { content: "The welcome email was helpful but the setup wizard could be clearer.", channel: "Support Ticket", sentiment: Sentiment.NEU, topic: "Onboarding" },
  { content: "Onboarding experience is smooth and intuitive. Impressed with the guided setup.", channel: "App Store Review", sentiment: Sentiment.POS, topic: "Onboarding" },
  { content: "New users struggle with workspace settings. Had to email support.", channel: "Support Ticket", sentiment: Sentiment.NEG, topic: "Onboarding" },
  { content: "Great job on the interactive onboarding tutorial!", channel: "Community Post", sentiment: Sentiment.POS, topic: "Onboarding" },

  // Performance
  { content: "Dashboard is slow when I have 10k+ feedback items. Takes 5+ seconds to load.", channel: "Support Ticket", sentiment: Sentiment.NEG, topic: "Performance" },
  { content: "Performance improved in the last update. Much snappier now.", channel: "App Store Review", sentiment: Sentiment.POS, topic: "Performance" },
  { content: "CSV uploads are timing out on large files (>5MB).", channel: "Support Ticket", sentiment: Sentiment.NEG, topic: "Performance" },
  { content: "Search is fast and responsive. No complaints.", channel: "NPS Survey", sentiment: Sentiment.POS, topic: "Performance" },
  { content: "Charts take forever to render with 6 months of data.", channel: "Support Ticket", sentiment: Sentiment.NEG, topic: "Performance" },

  // Billing
  { content: "Your pricing is reasonable for what we get. Worth every penny.", channel: "Sales Call Note", sentiment: Sentiment.POS, topic: "Billing" },
  { content: "Billing page keeps timing out. Can't download my invoice.", channel: "Support Ticket", sentiment: Sentiment.NEG, topic: "Billing" },
  { content: "Would like better volume discounts for larger teams.", channel: "Feature Request", sentiment: Sentiment.NEU, topic: "Billing" },
  { content: "Hidden fees in the pricing. Felt deceived.", channel: "App Store Review", sentiment: Sentiment.NEG, topic: "Billing" },

  // Mobile Experience
  { content: "Mobile app is barely usable. Navigation is broken on iPhone.", channel: "App Store Review", sentiment: Sentiment.NEG, topic: "Mobile Experience" },
  { content: "Web app works fine on mobile but would love a native app.", channel: "NPS Survey", sentiment: Sentiment.NEU, topic: "Mobile Experience" },
  { content: "The responsive design is great. Works perfectly on my iPad.", channel: "Community Post", sentiment: Sentiment.POS, topic: "Mobile Experience" },
  { content: "Can't filter feedback on mobile. Major limitation.", channel: "Support Ticket", sentiment: Sentiment.NEG, topic: "Mobile Experience" },

  // Authentication
  { content: "SSO integration would be huge for us. We're enterprise.", channel: "Sales Call Note", sentiment: Sentiment.NEU, topic: "Authentication" },
  { content: "Password reset email never arrived. Had to contact support.", channel: "Support Ticket", sentiment: Sentiment.NEG, topic: "Authentication" },
  { content: "Two-factor authentication works great. Secure and easy.", channel: "App Store Review", sentiment: Sentiment.POS, topic: "Authentication" },
  { content: "Login page is confusing. Users keep asking for password resets.", channel: "Support Ticket", sentiment: Sentiment.NEG, topic: "Authentication" },

  // Dashboard
  { content: "Dashboard gives us exactly what we need to make decisions.", channel: "Product Manager Feedback", sentiment: Sentiment.POS, topic: "Dashboard" },
  { content: "Dashboard is cluttered. Too much information at once.", channel: "Support Ticket", sentiment: Sentiment.NEG, topic: "Dashboard" },
  { content: "Would love customizable dashboard widgets.", channel: "Feature Request", sentiment: Sentiment.NEU, topic: "Dashboard" },
  { content: "Charts are beautiful and easy to understand.", channel: "NPS Survey", sentiment: Sentiment.POS, topic: "Dashboard" },

  // Notifications
  { content: "Getting too many email notifications. Need better controls.", channel: "Support Ticket", sentiment: Sentiment.NEG, topic: "Notifications" },
  { content: "Notification system is working well. Keeps us informed.", channel: "App Store Review", sentiment: Sentiment.POS, topic: "Notifications" },
  { content: "Notifications should include more context about what changed.", channel: "Feature Request", sentiment: Sentiment.NEU, topic: "Notifications" },

  // Search
  { content: "Search functionality is powerful. Finds exactly what I need.", channel: "Community Post", sentiment: Sentiment.POS, topic: "Search" },
  { content: "Search doesn't support boolean operators. Makes advanced queries hard.", channel: "Support Ticket", sentiment: Sentiment.NEG, topic: "Search" },
  { content: "Full-text search is decent but could use regex support.", channel: "Feature Request", sentiment: Sentiment.NEU, topic: "Search" },

  // Export
  { content: "Export to CSV is a lifesaver for reporting. Thank you!", channel: "Support Ticket", sentiment: Sentiment.POS, topic: "Export" },
  { content: "PDF export doesn't preserve formatting. Looks terrible.", channel: "Support Ticket", sentiment: Sentiment.NEG, topic: "Export" },
  { content: "Would love to export reports to Slack or email directly.", channel: "Feature Request", sentiment: Sentiment.NEU, topic: "Export" },

  // Integrations
  { content: "Zendesk integration is seamless. Saves us hours each week.", channel: "Testimonial", sentiment: Sentiment.POS, topic: "Integrations" },
  { content: "Jira integration is buggy. Tickets don't sync reliably.", channel: "Support Ticket", sentiment: Sentiment.NEG, topic: "Integrations" },
  { content: "We need Slack integration urgently. It's critical for our workflow.", channel: "Sales Call Note", sentiment: Sentiment.NEU, topic: "Integrations" },
  { content: "GitHub integration works well but the webhook is delayed sometimes.", channel: "Support Ticket", sentiment: Sentiment.NEG, topic: "Integrations" },

  // Pricing
  { content: "The free tier is too limited. Barely enough to try the product.", channel: "Support Ticket", sentiment: Sentiment.NEG, topic: "Pricing" },
  { content: "Great value for money. Switched from a competitor and saved 40%.", channel: "Testimonial", sentiment: Sentiment.POS, topic: "Pricing" },
  { content: "Enterprise plan pricing is not transparent. Need a quote.", channel: "Sales Call Note", sentiment: Sentiment.NEU, topic: "Pricing" },

  // Support
  { content: "Customer support team is amazing. Resolved my issue in 2 hours.", channel: "App Store Review", sentiment: Sentiment.POS, topic: "Support" },
  { content: "Support tickets take 48 hours to get a response. Too slow.", channel: "Support Ticket", sentiment: Sentiment.NEG, topic: "Support" },
  { content: "Documentation is good but some advanced features aren't explained well.", channel: "Support Ticket", sentiment: Sentiment.NEU, topic: "Support" },

  // Usability
  { content: "UI/UX is clean and intuitive. Easy for new users to learn.", channel: "Onboarding Feedback", sentiment: Sentiment.POS, topic: "Usability" },
  { content: "Too many clicks to get to common tasks. Workflow is inefficient.", channel: "Support Ticket", sentiment: Sentiment.NEG, topic: "Usability" },
  { content: "Dark mode would make this perfect for late-night work.", channel: "Feature Request", sentiment: Sentiment.NEU, topic: "Usability" },

  // General Positive
  { content: "Love this product. It's exactly what we needed.", channel: "Testimonial", sentiment: Sentiment.POS, topic: "General" },
  { content: "Best customer feedback tool we've used. Highly recommend.", channel: "Community Post", sentiment: Sentiment.POS, topic: "General" },
  { content: "This platform has transformed how we make product decisions.", channel: "Case Study", sentiment: Sentiment.POS, topic: "General" },

  // General Negative
  { content: "Switched away due to reliability issues. Too many outages.", channel: "Churned Customer", sentiment: Sentiment.NEG, topic: "General" },
  { content: "The product doesn't do what was promised in the sales call.", channel: "Support Ticket", sentiment: Sentiment.NEG, topic: "General" },
  { content: "Disappointed. Expected much more for the price.", channel: "App Store Review", sentiment: Sentiment.NEG, topic: "General" },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Clean up existing data
  await prisma.feedbackTheme.deleteMany({});
  await prisma.embedding.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.theme.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.workspace.deleteMany({});

  console.log("✓ Cleaned up existing data");

  // Create workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: "Demo Company",
    },
  });

  console.log(`✓ Created workspace: ${workspace.name}`);

  // Create users
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@demo.com",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: UserRole.ADMIN,
      workspaceId: workspace.id,
    },
  });

  const analystUser = await prisma.user.create({
    data: {
      name: "Analyst User",
      email: "analyst@demo.com",
      passwordHash: await bcrypt.hash("analyst123", 10),
      role: UserRole.ANALYST,
      workspaceId: workspace.id,
    },
  });

  const viewerUser = await prisma.user.create({
    data: {
      name: "Viewer User",
      email: "viewer@demo.com",
      passwordHash: await bcrypt.hash("viewer123", 10),
      role: UserRole.VIEWER,
      workspaceId: workspace.id,
    },
  });

  console.log("✓ Created 3 users (Admin, Analyst, Viewer)");

  // Create themes
  const themeNames = [
    { name: "Onboarding", description: "Issues and feedback related to user onboarding experience", color: "#f97316" },
    { name: "Performance", description: "Speed, latency, and load time complaints", color: "#ef4444" },
    { name: "Billing", description: "Pricing, payment, and invoicing issues", color: "#eab308" },
    { name: "Mobile Experience", description: "Mobile app and responsive design issues", color: "#06b6d4" },
    { name: "Authentication", description: "Login, signup, SSO, and security features", color: "#8b5cf6" },
    { name: "Dashboard", description: "Dashboard layout, charts, and analytics", color: "#3b82f6" },
    { name: "Notifications", description: "Email, in-app, and notification preferences", color: "#10b981" },
    { name: "Search", description: "Search functionality and filtering capabilities", color: "#6366f1" },
    { name: "Export", description: "Data export, reports, and integrations", color: "#ec4899" },
    { name: "Support", description: "Customer support and documentation quality", color: "#14b8a6" },
  ];

  const themes = await Promise.all(
    themeNames.map((theme) =>
      prisma.theme.create({
        data: {
          ...theme,
          workspaceId: workspace.id,
        },
      })
    )
  );

  console.log(`✓ Created ${themes.length} themes`);

  // Create feedback with smart theme assignment
  const createdFeedback = [];
  for (let i = 0; i < feedbackSamples.length; i++) {
    const sample = feedbackSamples[i];
    
    // Add some variation in dates (last 60 days)
    const daysAgo = Math.floor(Math.random() * 60);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    const feedback = await prisma.feedback.create({
      data: {
        content: sample.content,
        channel: sample.channel,
        customerLabel: `Customer ${i + 1}`,
        sentiment: sample.sentiment,
        sentimentScore:
          sample.sentiment === Sentiment.POS
            ? 0.7 + Math.random() * 0.3
            : sample.sentiment === Sentiment.NEG
            ? -0.7 - Math.random() * 0.3
            : Math.random() * 0.4 - 0.2,
        status: [FeedbackStatus.NEW, FeedbackStatus.REVIEWED, FeedbackStatus.ACTIONED][
          Math.floor(Math.random() * 3)
        ],
        workspaceId: workspace.id,
        createdAt,
      },
    });

    // Assign relevant theme
    const relevantTheme = themes.find((t) =>
      t.name.toLowerCase().includes(sample.topic.toLowerCase())
    );

    if (relevantTheme) {
      await prisma.feedbackTheme.create({
        data: {
          feedbackId: feedback.id,
          themeId: relevantTheme.id,
          confidence: 0.8 + Math.random() * 0.2, // 0.8-1.0
        },
      });
    }

    createdFeedback.push(feedback);
  }

  console.log(`✓ Created ${createdFeedback.length} realistic feedback items`);

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📋 Demo Credentials:");
  console.log("   Admin:   admin@demo.com / admin123");
  console.log("   Analyst: analyst@demo.com / analyst123");
  console.log("   Viewer:  viewer@demo.com / viewer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });