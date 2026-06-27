import { NextResponse } from "next/server";
import { z } from "zod";

import { buildVocabularyWordFiche } from "@/lib/vocabulary/build-vocabulary-word-fiche";

const querySchema = z.object({
  id: z.string().min(1),
  displayForm: z.string().min(1),
  headword: z.string().optional(),
  textId: z.string().min(1),
  savedAt: z.string().min(1),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    id: searchParams.get("id"),
    displayForm: searchParams.get("displayForm"),
    headword: searchParams.get("headword") ?? undefined,
    textId: searchParams.get("textId"),
    savedAt: searchParams.get("savedAt"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Paramètres de fiche invalides." }, { status: 400 });
  }

  try {
    const fiche = await buildVocabularyWordFiche({
      savedWordId: parsed.data.id,
      displayForm: parsed.data.displayForm,
      headword: parsed.data.headword ?? null,
      textId: parsed.data.textId,
      savedAt: parsed.data.savedAt,
    });

    if (!fiche) {
      return NextResponse.json(
        { error: "Aucune fiche linguistique trouvée pour ce mot." },
        { status: 404 },
      );
    }

    return NextResponse.json({ fiche });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Échec du chargement de la fiche.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
