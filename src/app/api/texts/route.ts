import { NextResponse } from "next/server";

import { listTexts } from "@/features/texts";
import type { CefrLevel } from "@/types";

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "Native"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const levelParam = searchParams.get("level");
  const search = searchParams.get("search") ?? undefined;

  const level =
    levelParam && LEVELS.includes(levelParam as CefrLevel)
      ? (levelParam as CefrLevel)
      : undefined;

  const texts = await listTexts({ level, search });
  return NextResponse.json({ texts });
}
