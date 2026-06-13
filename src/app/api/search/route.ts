import { NextResponse } from "next/server";

import { universalSearch } from "@/features/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limit = Number(searchParams.get("limit") ?? "8");

  if (q.trim().length < 1) {
    return NextResponse.json({
      lemmas: [],
      forms: [],
      endings: [],
      concepts: [],
      phrases: [],
      texts: [],
    });
  }

  const results = await universalSearch(q, Number.isFinite(limit) ? limit : 8);
  return NextResponse.json(results);
}
