import { NextResponse } from "next/server";
import { z } from "zod";

import { runKnowledgeBackfill } from "@/features/backfill";
import { verifyAdminRequest } from "@/lib/admin/verify-admin";

const bodySchema = z.object({
  textIds: z.array(z.string()).optional(),
  dryRun: z.boolean().optional(),
});

export async function POST(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: unknown = {};
  try {
    const text = await request.text();
    if (text) {
      body = JSON.parse(text);
    }
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

  const report = await runKnowledgeBackfill(parsed.data);
  return NextResponse.json({ report });
}
