import type { GraphOccurrenceSummary, LemmaExampleRef, LemmaTextRef } from "@/types/knowledge-graph";
import { isDisplayableUiText } from "@/lib/formatting/ui-placeholder-guard";

export function groupLemmaTexts(occurrences: GraphOccurrenceSummary[]): LemmaTextRef[] {
  const grouped = new Map<string, LemmaTextRef>();

  for (const occurrence of occurrences) {
    if (!occurrence.textId || !occurrence.textTitle) {
      continue;
    }

    const existing = grouped.get(occurrence.textId);
    if (existing) {
      existing.occurrenceCount += 1;
      continue;
    }

    grouped.set(occurrence.textId, {
      textId: occurrence.textId,
      textTitle: occurrence.textTitle,
      sentenceRussian: occurrence.sentenceRussian,
      occurrenceCount: 1,
    });
  }

  return [...grouped.values()].sort((a, b) => b.occurrenceCount - a.occurrenceCount);
}

export function mapLemmaExamples(occurrences: GraphOccurrenceSummary[]): LemmaExampleRef[] {
  const seen = new Set<string>();

  return occurrences
    .filter((occurrence) => {
      if (seen.has(occurrence.sentenceRussian)) {
        return false;
      }
      seen.add(occurrence.sentenceRussian);
      return true;
    })
    .slice(0, 8)
    .map((occurrence) => ({
      id: occurrence.id,
      sentenceRussian: occurrence.sentenceRussian,
      naturalTranslation: isDisplayableUiText(occurrence.naturalTranslation)
        ? occurrence.naturalTranslation!.trim()
        : null,
      textId: occurrence.textId,
      textTitle: occurrence.textTitle,
    }));
}

export function attachCollectionIds<T extends { textId: string | null }>(
  refs: T[],
  metaByTextId: Map<string, { collectionId: string }>,
): Array<T & { collectionId?: string }> {
  return refs.map((ref) => ({
    ...ref,
    collectionId: ref.textId ? metaByTextId.get(ref.textId)?.collectionId : undefined,
  }));
}
