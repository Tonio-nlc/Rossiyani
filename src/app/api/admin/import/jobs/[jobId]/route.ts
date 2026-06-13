import { NextResponse } from "next/server";

import { getBulkImportProgress, resumeBulkImportJob } from "@/features/bulk-import";
import { verifyAdminRequest } from "@/lib/admin/verify-admin";

type RouteParams = { params: Promise<{ jobId: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { jobId } = await params;
  const progress = await getBulkImportProgress(jobId);
  if (!progress) {
    return NextResponse.json({ error: "Job introuvable" }, { status: 404 });
  }

  return NextResponse.json({ progress });
}

export async function POST(request: Request, { params }: RouteParams) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { jobId } = await params;
  const progress = await resumeBulkImportJob(jobId);
  return NextResponse.json({ progress });
}
