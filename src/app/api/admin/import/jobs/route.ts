import { NextResponse } from "next/server";

import { listImportJobs } from "@/features/bulk-import";
import { verifyAdminRequest } from "@/lib/admin/verify-admin";

export async function GET(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "20");

  const jobs = await listImportJobs(Number.isFinite(limit) ? limit : 20);
  return NextResponse.json({ jobs });
}
