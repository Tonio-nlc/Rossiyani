import { NextResponse } from "next/server";

import { getReviewCandidates } from "@/features/admin";
import { verifyAdminRequest } from "@/lib/admin/verify-admin";

export async function GET(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "100");

  const candidates = await getReviewCandidates(Number.isFinite(limit) ? limit : 100);
  return NextResponse.json({ candidates });
}
