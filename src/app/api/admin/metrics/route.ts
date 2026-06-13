import { NextResponse } from "next/server";

import { getKnowledgeMetrics } from "@/features/admin";
import { verifyAdminRequest } from "@/lib/admin/verify-admin";

export async function GET(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const metrics = await getKnowledgeMetrics();
  return NextResponse.json({ metrics });
}
