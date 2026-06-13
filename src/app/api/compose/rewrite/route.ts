import { NextResponse } from "next/server";
import { z } from "zod";

import { rewriteComposeText } from "@/services/compose/analyze-compose";

const bodySchema = z.object({
  russianText: z.string().min(1).max(4000),
  instruction: z.string().min(1).max(500),
  context: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const result = await rewriteComposeText(body);
    return NextResponse.json({ rewritten: result.text, explanation: result.explanation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Rewrite failed" }, { status: 500 });
  }
}
