import { NextResponse } from "next/server";

import type { AuthSession } from "@/lib/auth/types";
import { getServerSession } from "@/services/auth/session";

export async function requireAuthSession(): Promise<AuthSession | NextResponse> {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }
  return session;
}

export function isAuthResponse(value: AuthSession | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
