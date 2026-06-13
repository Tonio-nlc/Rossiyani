import { NextResponse } from "next/server";

import { getStructureContext } from "@/features/practice/get-structure-context";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const label = searchParams.get("label");

  if (!label?.trim()) {
    return NextResponse.json({ error: "Missing label" }, { status: 400 });
  }

  const context = await getStructureContext(label);
  if (!context) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ context });
}
