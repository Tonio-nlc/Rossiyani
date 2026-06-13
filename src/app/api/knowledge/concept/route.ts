import { NextResponse } from "next/server";

import { getConceptKnowledge } from "@/features/knowledge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Paramètre key requis" }, { status: 400 });
  }

  const concept = await getConceptKnowledge(key);
  if (!concept) {
    return NextResponse.json({ error: "Concept introuvable" }, { status: 404 });
  }

  return NextResponse.json({ concept });
}
