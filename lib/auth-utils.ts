import { auth } from "./auth";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    return {
      authenticated: false,
      session: null,
    };
  }

  return {
    authenticated: true,
    session,
  };
}

export async function requireRole(...roles: string[]) {
  const { authenticated, session } = await requireAuth();

  if (!authenticated || !session?.user) {
    return {
      authorized: false,
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!roles.includes((session.user as any).role)) {
    return {
      authorized: false,
      session,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    authorized: true,
    session,
    error: null,
  };
}