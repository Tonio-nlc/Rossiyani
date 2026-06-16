import { NextResponse } from "next/server";

import { getTextEnrichmentStatus } from "@/pipeline";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const status = await getTextEnrichmentStatus(id);

  if (!status) {
    return NextResponse.json({ error: "Text not found" }, { status: 404 });
  }

  return NextResponse.json(status);
}
