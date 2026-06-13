import type { RelatedTextRef } from "@/types/knowledge-graph";

/** Deduplicates related text references by textId + sentence. */
export function mergeRelatedTexts(...groups: RelatedTextRef[][]): RelatedTextRef[] {
  const seen = new Set<string>();
  const result: RelatedTextRef[] = [];

  for (const group of groups) {
    for (const ref of group) {
      const key = `${ref.textId}|${ref.sentenceRussian}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      result.push(ref);
    }
  }

  return result.sort((a, b) => a.textTitle.localeCompare(b.textTitle, "fr"));
}

export function mapOccurrencesToRelatedTexts(
  occurrences: Array<{
    textId: string | null;
    textTitle: string | null;
    sentenceRussian: string;
  }>,
): RelatedTextRef[] {
  return occurrences
    .filter((o): o is typeof o & { textId: string; textTitle: string } =>
      Boolean(o.textId && o.textTitle),
    )
    .map((o) => ({
      textId: o.textId,
      textTitle: o.textTitle,
      sentenceRussian: o.sentenceRussian,
    }));
}
