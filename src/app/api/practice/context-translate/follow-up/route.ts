import { NextResponse } from "next/server";
import { z } from "zod";

import type { ContextTranslationAnalysis } from "@/lib/context-translation/types";
import { answerContextTranslationFollowUp } from "@/services/context-translation/analyze-context-translation";

const bodySchema = z.object({
  analysis: z.custom<ContextTranslationAnalysis>(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .default([]),
  question: z.string().min(1).max(1000),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const answer = await answerContextTranslationFollowUp(
      body.analysis,
      body.history,
      body.question,
    );
    return NextResponse.json({ answer });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Follow-up failed" }, { status: 500 });
  }
}
