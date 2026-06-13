import { NextResponse } from "next/server";

import { getWordDetailGraphFromDb } from "@/features/reader";
import type { WordDetailSection } from "@/types/word-detail-graph";
import { WORD_DETAIL_SECTIONS } from "@/types/word-detail-graph";

const VALID_SECTIONS = new Set<string>(WORD_DETAIL_SECTIONS);

function parseSections(raw: string | null): WordDetailSection[] {
  if (!raw) {
    return WORD_DETAIL_SECTIONS;
  }
  const requested = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is WordDetailSection => VALID_SECTIONS.has(s));
  return requested.length > 0 ? requested : WORD_DETAIL_SECTIONS;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const sections = parseSections(searchParams.get("sections"));

  const detail = await getWordDetailGraphFromDb(id, sections);

  if (!detail) {
    return NextResponse.json({ error: "Mot introuvable" }, { status: 404 });
  }

  return NextResponse.json({ detail });
}
