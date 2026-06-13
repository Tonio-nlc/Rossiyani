import { NextResponse } from "next/server";
import { z } from "zod";

import { analyzeComposeText } from "@/services/compose/analyze-compose";

const bodySchema = z.object({
  context: z.string().optional(),
  russianText: z.string().min(1).max(4000),
  theme: z
    .enum(["daily_life", "work", "travel", "literature", "conversation", "free"])
    .optional(),
  register: z.enum(["casual", "neutral", "formal"]).optional(),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const analysis = await analyzeComposeText(body);
    return NextResponse.json({ analysis });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
