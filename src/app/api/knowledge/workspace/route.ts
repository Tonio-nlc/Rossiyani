import { NextResponse } from "next/server";
import { z } from "zod";

import { getWordKnowledgeWorkspace } from "@/features/knowledge";
import { partOfSpeechSchema } from "@/services/ai/schemas";

const workspaceRequestSchema = z.object({
  original: z.string().min(1),
  stressMarked: z.string().min(1),
  lemma: z.string().min(1),
  partOfSpeech: partOfSpeechSchema,
  stem: z.string(),
  ending: z.string(),
  case: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  number: z.string().nullable().optional(),
  tense: z.string().nullable().optional(),
  aspect: z.string().nullable().optional(),
  explanation: z.string().min(1),
  frequency: z.string().nullable().optional(),
  translationCanonical: z.string().nullable().optional(),
  translationAlternatives: z.array(z.string()).optional(),
  previousWord: z
    .object({
      original: z.string(),
      partOfSpeech: z.string(),
    })
    .nullable()
    .optional(),
  phraseOccurrence: z
    .object({
      label: z.string(),
      type: z.enum(["COLLOCATION", "FIXED_EXPRESSION", "NATIVE_CONSTRUCTION"]),
      explanation: z.string(),
    })
    .nullable()
    .optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const parsed = workspaceRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Paramètres invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const workspace = await getWordKnowledgeWorkspace({
    ...parsed.data,
    case: parsed.data.case ?? null,
    gender: parsed.data.gender ?? null,
    number: parsed.data.number ?? null,
    tense: parsed.data.tense ?? null,
    aspect: parsed.data.aspect ?? null,
    frequency: parsed.data.frequency ?? null,
    translationCanonical: parsed.data.translationCanonical ?? null,
    translationAlternatives: parsed.data.translationAlternatives ?? [],
    previousWord: parsed.data.previousWord ?? null,
    phraseOccurrence: parsed.data.phraseOccurrence ?? null,
  });

  return NextResponse.json({ workspace });
}
