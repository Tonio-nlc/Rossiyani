import type { ReaderTextData } from "@/features/texts";
import type { WordDetailGraph } from "@/types/word-detail-graph";

import { getWordDetailGraphFromDb } from "./get-word-detail-graph";

/**
 * Preloads all word detail graphs for a text at render time.
 * Reader performs local lookup only — no client fetch on word click.
 */
export async function getTextWordDetailCache(
  text: ReaderTextData,
): Promise<Record<string, WordDetailGraph>> {
  const wordIds = [
    ...new Set(
      text.sentences.flatMap((sentence) => sentence.words.map((word) => word.id)),
    ),
  ].filter((id) => !id.startsWith("orphan:"));

  const entries = await Promise.all(
    wordIds.map(async (wordId) => {
      const detail = await getWordDetailGraphFromDb(wordId);
      return detail ? ([wordId, detail] as const) : null;
    }),
  );

  return Object.fromEntries(entries.filter((entry): entry is [string, WordDetailGraph] => entry !== null));
}
