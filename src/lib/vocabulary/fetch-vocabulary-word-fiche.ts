import type { SavedReaderWord } from "@/lib/reader/saved-words";

import type { VocabularyWordFiche } from "./vocabulary-word-fiche-types";

export async function fetchVocabularyWordFiche(
  word: SavedReaderWord,
): Promise<VocabularyWordFiche | null> {
  const params = new URLSearchParams({
    id: word.id,
    displayForm: word.displayForm,
    textId: word.textId,
    savedAt: word.savedAt,
  });
  if (word.lemma) {
    params.set("headword", word.lemma);
  }

  const response = await fetch(`/api/vocabulary/fiche?${params.toString()}`);
  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { fiche?: VocabularyWordFiche };
  return payload.fiche ?? null;
}
