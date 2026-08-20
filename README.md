# LOOP — AI Customer-Feedback Intelligence Platform

> **Enterprise-Grade Voice-of-Customer (VoC) & Feedback Analytics Engine**  
> *Transforming unstructured omnichannel feedback into ranked, evidence-backed product decisions through deterministic multi-tenant isolation and grounded Retrieval-Augmented Generation (RAG).*

---

## 🏛️ System Architecture & Engineering Highlights

LOOP is engineered with a robust three-tier architecture ensuring complete tenant isolation and strict server-side execution:

```
┌─────────────────────────────────────────────────────┐
│  Browser / Client (Next.js 14 App Router)           │
└────────────────────┬────────────────────────────────┘
                     │ (Secure HTTPS / NextAuth Sessions)
                     ▼
┌─────────────────────────────────────────────────────┐
│  Route Handlers & Server Actions                    │
│  (Zod Validation + RBAC)                            │
└────────────┬────────────────────────────┬───────────┘
             │                            │
             ▼ (Prisma ORM)               ▼ (Vector Search)
    ┌──────────────────┐        ┌────────────────────┐
    │ PostgreSQL       │        │ Embeddings /       │
    │ Database (Neon)  │        │ Vector Engine      │
    └────────┬─────────┘        └────────────────────┘
             │
             ▼ (Retrieve-then-Answer Context)
    ┌──────────────────────────────────────────┐
    │  Claude 3.5 Sonnet / Gemini API         │
    └──────────────────────────────────────────┘
```

### Key Architectural Principles

* **Strict Multi-Tenant Data Isolation:** Every primary database entity (`Feedback`, `Theme`, `Report`, `User`) contains a foreign key constraint linked to a unique `workspaceId`. All Prisma queries strictly inject workspace scoping clauses, preventing cross-tenant data leakage.
* **Role-Based Access Control (RBAC):** Enforces granular server-side authorization across three organizational tiers (`ADMIN`, `ANALYST`, `VIEWER`).
* **Grounded RAG Pipeline:** "Ask LOOP" performs vector similarity search over stored feedback embeddings before prompting the LLM, mapping exact verbatim citations to eliminate hallucinations.

---

## 💻 Technology Stack Specification

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, Server & Client Components) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS |
| **Database** | PostgreSQL (Neon / Supabase) |
| **ORM** | Prisma ORM (3NF Relational Schema) |
| **Authentication** | NextAuth.js (Auth.js) with JWT Session Strategy |
| **AI Engine** | Anthropic Claude API / Google Gemini API |
| **Vector Search** | Semantic Retrieval via Cosine Similarity & Vector Embeddings |
| **Data Visualization** | Recharts for Dynamic Time-Series & Sentiment Analytics |
| **Validation** | Zod Runtime Schema Validation |
| **Deployment** | Vercel (Edge-Ready Deployment) |

---

## 🚀 Core & AI Features

### 1. Core Application Modules

* **Multi-Tenant Workspaces:** Private corporate workspaces with isolated user rosters, settings, and feedback pipelines.
* **Role-Based Access Control:** Role-restricted permissions ensuring secure workflow execution.
* **Omnichannel Ingestion:** Manual single-entry forms, batch CSV processing, and simulated integration data streams.
* **Triage Inbox:** Server-side paginated grid featuring real-time full-text search, multi-faceted filtering, and state transitions (`NEW` → `REVIEWED` → `ACTIONED`).
* **Executive Analytics:** Dynamic time-series charts, rolling sentiment polarity distributions, and emergent theme volume tracking.

### 2. AI Intelligence Pipeline

* **Auto-Classification:** Real-time extraction of sentiment, sentiment score (-1.0 to +1.0), feature areas, and thematic tags validated via strict Zod JSON schemas.
* **Theme Clustering & Anomaly Detection:** Automated velocity monitoring and spike detection identifying surging friction points compared against historical periods.
* **Ask LOOP (RAG):** Conversational Q&A grounded strictly in stored customer feedback with cited evidence cards.
* **Voice-of-Customer (VoC) Dossiers:** Pre-computed statistical summaries paired with executive narrative synthesis, exportable to print/PDF.

---

## 🔑 Evaluation Sandbox Credentials

The seeded demo environment includes pre-configured credentials across organizational tiers:

| Role | Email Address | Password | Permissions Scope |
|---|---|---|---|
| **Admin** | `admin@demo.com` | `admin123` | Full workspace control, team management, and system configuration |
| **Analyst** | `analyst@demo.com` | `analyst123` | Feedback ingestion, AI classification runs, Ask LOOP, and report generation |
| **Viewer** | `viewer@demo.com` | `viewer123` | Secure read-only auditing for dashboards, trends, and reports |

---

## 🛠️ Getting Started Locally

### Prerequisites

* Node.js 18.x or 20.x LTS
* PostgreSQL Database Instance (Local or Neon/Supabase)
* Git

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/MdRabbiMiah/loop.git
cd loop
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Configure Environment Variables

Create a `.env.local` file in the root directory matching `.env.example`:

```env
DATABASE_URL="postgresql://user:password@host:5432/loop_db?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_generated_32_char_jwt_secret_key"
ANTHROPIC_API_KEY="your_anthropic_or_gemini_api_key"
```

#### 4. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

#### 5. Seed Demo Data

Load 160+ realistic feedback items, workspaces, and users:

```bash
npx prisma db seed
```

#### 6. Start the Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🗄️ Database Schema Architecture (Prisma)

### Entity-Relationship Overview

```prisma
model Workspace {
  id        String     @id @default(cuid())
  name      String
  createdAt DateTime   @default(now())
  users     User[]
  feedback  Feedback[]
  themes    Theme[]
  reports   Report[]
}

model User {
  id           String    @id @default(cuid())
  name         String?
  email        String    @unique
  passwordHash String
  role         UserRole  @default(VIEWER)
  workspaceId  String
  workspace    Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  createdAt    DateTime  @default(now())
}

enum UserRole {
  ADMIN
  ANALYST
  VIEWER
}

model Feedback {
  id             String          @id @default(cuid())
  content        String
  channel        String
  customerLabel  String?
  sentiment      Sentiment       @default(NEU)
  sentimentScore Float           @default(0.0)
  status         FeedbackStatus  @default(NEW)
  workspaceId    String
  workspace      Workspace       @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  themes         FeedbackTheme[]
  embedding      Embedding?
  createdAt      DateTime        @default(now())
}

enum Sentiment {
  POS
  NEU
  NEG
}

enum FeedbackStatus {
  NEW
  REVIEWED
  ACTIONED
}

model Theme {
  id          String          @id @default(cuid())
  name        String
  description String?
  color       String?
  workspaceId String
  workspace   Workspace       @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  feedback    FeedbackTheme[]
}

model FeedbackTheme {
  feedbackId String
  themeId    String
  confidence Float    @default(1.0)
  feedback   Feedback @relation(fields: [feedbackId], references: [id], onDelete: Cascade)
  theme      Theme    @relation(fields: [themeId], references: [id], onDelete: Cascade)

  @@id([feedbackId, themeId])
}

model Embedding {
  id         String   @id @default(cuid())
  feedbackId String   @unique
  feedback   Feedback @relation(fields: [feedbackId], references: [id], onDelete: Cascade)
  vector     String
}

model Report {
  id          String    @id @default(cuid())
  title       String
  periodStart DateTime
  periodEnd   DateTime
  contentJson String
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
}
```

### Schema Design Principles

* **3NF Normalization:** Eliminates data redundancy and ensures referential integrity
* **Workspace Scoping:** Every entity except `Workspace` and `User` includes `workspaceId` to enforce tenant isolation
* **Temporal Tracking:** `createdAt` timestamps on all entities for audit trails and analytics
* **Cascading Deletes:** Orphaned records are automatically purged when parent entities are deleted

---

## 📦 Submission Deliverables

* **Live Application URL:** [https://loop-intelligence.vercel.app](https://loop-intelligence.vercel.app)
* **Demo Walkthrough Video (3–5 min):** Available upon request
* **Self-Feedback Video (1–2 min):** Available upon request
* **GitHub Repository:** https://github.com/shahed-hassan-fz-rabbi/Loop-Feedback-Analysis

---

## 🔐 Security & Compliance

* **JWT-Based Session Management:** Stateless authentication with secure token signing
* **Server-Side Authorization:** All data access is protected by RBAC and workspace scoping
* **SQL Injection Prevention:** Parameterized queries via Prisma ORM
* **Data Encryption:** Support for SSL/TLS encrypted database connections
* **Audit Logging:** Timestamped records for all entity mutations

---

## 📊 Key Metrics & Use Cases

### Ideal For

* **Customer Success Teams:** Track customer satisfaction trends and emerging pain points
* **Product Management:** Identify feature requests and prioritize roadmap items with quantified evidence
* **Support Operations:** Monitor support ticket themes and volume spikes
* **Executive Leadership:** Access VoC dashboards for data-driven decision making
* **Research & Analytics:** Perform sentiment analysis and customer sentiment journey mapping

---

## 👤 Author & Contact

**Md Rabbi Miah**

Department of Computer Science and Engineering, Comilla University

* **Project Repository:** https://github.com/shahed-hassan-fz-rabbi/Loop-Feedback-Analysis



