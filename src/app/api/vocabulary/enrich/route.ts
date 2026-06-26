import { NextResponse } from "next/server";

import { enrichWordForApi } from "@/lib/vocabulary/enrich-word-server";

type EnrichRequestBody = {
  words?: Array<{
    id: string;
    russian: string;
    headword: string | null;
  }>;
};

export async function POST(request: Request) {
  let body: EnrichRequestBody;

  try {
    body = (await request.json()) as EnrichRequestBody;
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const words = body.words ?? [];
  if (words.length === 0) {
    return NextResponse.json({ words: [] });
  }

  if (words.length > 50) {
    return NextResponse.json({ error: "Maximum 50 mots par requête" }, { status: 400 });
  }

  const enriched = await Promise.all(
    words.map((word) =>
      enrichWordForApi({
        id: word.id,
        russian: word.russian,
        headword: word.headword,
      }),
    ),
  );

  return NextResponse.json({ words: enriched });
}
