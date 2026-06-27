import { NextResponse } from "next/server";

import { getServerSession } from "@/services/auth/session";

export async function GET() {
  const session = await getServerSession();
  return NextResponse.json(session ?? { user: null });
}
