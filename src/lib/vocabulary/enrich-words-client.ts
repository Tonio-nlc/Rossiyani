import type { VocabularyWordEnrichment } from "./types";

export async function fetchWordEnrichment(
  words: Array<{ id: string; russian: string; headword: string | null }>,
): Promise<VocabularyWordEnrichment[]> {
  if (words.length === 0) {
    return [];
  }

  try {
    const response = await fetch("/api/vocabulary/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ words }),
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { words?: VocabularyWordEnrichment[] };
    return payload.words ?? [];
  } catch {
    return [];
  }
}
