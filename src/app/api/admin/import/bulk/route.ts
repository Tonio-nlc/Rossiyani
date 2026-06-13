import { NextResponse } from "next/server";
import { z } from "zod";

import { enqueueBulkImport, runBulkImportJob } from "@/features/bulk-import";
import { verifyAdminRequest } from "@/lib/admin/verify-admin";

const bodySchema = z.object({
  jobName: z.string().min(1),
  folderPath: z.string().min(1),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "Native"]),
  source: z.string().optional(),
  delayBetweenSentencesMs: z.number().int().nonnegative().optional(),
  concurrency: z.number().int().min(1).max(4).optional(),
  recursive: z.boolean().optional(),
  runImmediately: z.boolean().optional(),
});

export async function POST(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Corps invalide", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const job = await enqueueBulkImport(parsed.data);

  if (parsed.data.runImmediately !== false) {
    const progress = await runBulkImportJob(job.id, {
      source: parsed.data.source,
      delayBetweenSentencesMs: parsed.data.delayBetweenSentencesMs,
      concurrency: parsed.data.concurrency,
    });
    return NextResponse.json({ jobId: job.id, progress }, { status: 201 });
  }

  return NextResponse.json({ jobId: job.id, totalFiles: job.totalFiles }, { status: 201 });
}
