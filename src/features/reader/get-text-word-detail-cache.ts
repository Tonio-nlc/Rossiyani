/**
 * @deprecated Use client-side progressive loading via `reader-word-detail-store`.
 * Kept for tooling/tests that need bulk server-side preload.
 */
import type { ReaderTextData } from "@/features/texts";
import type { WordDetailGraph } from "@/types/word-detail-graph";

import { getWordDetailGraphFromDb } from "./get-word-detail-graph";

export async function getTextWordDetailCache(
  text: ReaderTextData,
): Promise<Record<string, WordDetailGraph>> {
  const wordIds = [
    ...new Set(
      text.sentences.flatMap((sentence) => sentence.words.map((word) => word.id)),
    ),
  ].filter((id) => !id.startsWith("orphan:"));

  const entries: Array<[string, WordDetailGraph]> = [];

  for (const wordId of wordIds) {
    const detail = await getWordDetailGraphFromDb(wordId);
    if (detail) {
      entries.push([wordId, detail]);
    }
  }

  return Object.fromEntries(entries);
}
