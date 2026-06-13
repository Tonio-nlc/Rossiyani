import { NextResponse } from "next/server";

import { getSentenceDetail } from "@/features/sentences";

type RouteParams = { params: Promise<{ id: string; sentenceId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id, sentenceId } = await params;
  const sentence = await getSentenceDetail(id, sentenceId);
  if (!sentence) {
    return NextResponse.json({ error: "Phrase introuvable" }, { status: 404 });
  }
  return NextResponse.json({ sentence });
}
