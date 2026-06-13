import { getWordDetailGraphFromDb } from "@/features/reader";
import { knowledgeLookupService } from "@/services/knowledge";
import type { WordKnowledgeContext } from "@/types/linguistic-library";
import { WORD_DETAIL_BASIC_SECTION } from "@/types/word-detail-graph";

/**
 * Reader enrichment from the Knowledge Graph.
 * Prefers getWordDetailGraphFromDb when wordId is available; falls back to LinguisticLibrary lookup.
 */
export async function getWordKnowledge(
  original: string,
  ending?: string | null,
  grammaticalCase?: string | null,
  wordId?: string,
): Promise<WordKnowledgeContext | null> {
  if (wordId) {
    const detail = await getWordDetailGraphFromDb(wordId, [WORD_DETAIL_BASIC_SECTION]);
    if (!detail) {
      return null;
    }
    return {
      fromLibrary: true,
      formHitCount: detail.statistics.libraryHitCount ?? 1,
      canonicalExplanation: detail.canonicalExplanation,
      lemma: detail.occurrence.lemma,
      knownEnding: detail.domain.ending
        ? {
            id: detail.domain.ending.id,
            ending: detail.domain.ending.ending,
            caseKey: detail.domain.ending.caseKey,
            partOfSpeech: detail.domain.ending.partOfSpeech,
            explanationFr: detail.domain.ending.explanationFr,
            hitCount: detail.domain.ending.hitCount,
          }
        : null,
      relatedPhrase: detail.phraseKnowledge
        ? {
            id: detail.phraseKnowledge.label,
            label: detail.phraseKnowledge.label,
            type: detail.phraseKnowledge.type,
            explanation: detail.phraseKnowledge.canonicalExplanation ?? "",
            hitCount: detail.phraseKnowledge.occurrenceCount,
          }
        : null,
    };
  }

  const form = await knowledgeLookupService.lookupForm(original);
  if (!form) {
    return null;
  }

  const knownEnding =
    ending || form.ending
      ? await knowledgeLookupService.lookupEnding(
          ending ?? form.ending,
          grammaticalCase ?? form.case,
        )
      : null;

  return {
    fromLibrary: true,
    formHitCount: form.hitCount,
    canonicalExplanation: form.explanation,
    lemma: form.lemma?.lemma ?? form.original,
    knownEnding,
    relatedPhrase: null,
  };
}
