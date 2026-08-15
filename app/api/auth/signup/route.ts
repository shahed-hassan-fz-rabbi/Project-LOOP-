import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  workspaceName: z.string().min(2, "Workspace name must be at least 2 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { name, email, password, workspaceName } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create workspace and user in transaction
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN", // First user is always admin
        workspace: {
          create: {
            name: workspaceName,
          },
        },
      },
      include: {
        workspace: true,
      },
    });

    return NextResponse.json(
      {
        message: "Signup successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          workspaceId: user.workspaceId,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}