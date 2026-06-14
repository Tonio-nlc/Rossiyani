import { searchKnowledge } from "@/services/knowledge-graph";
import type { KnowledgeSearchResult } from "@/services/knowledge-graph/search-knowledge";
import { searchCuratedCandidates } from "@/features/explorer/entity/curated-lookup";
import { phraseLookupKey } from "@/lib/normalization/russian-key";

function mergeCuratedResults(
  query: string,
  results: KnowledgeSearchResult,
  limit: number,
): KnowledgeSearchResult {
  const curatedMatches = searchCuratedCandidates(query, limit);
  const next = { ...results };

  for (const candidate of curatedMatches) {
    const id = `curated:${candidate.type}:${candidate.lemma}`;

    if (candidate.type === "WORD") {
      if (!next.lemmas.some((lemma) => phraseLookupKey(lemma.lemma) === phraseLookupKey(candidate.lemma))) {
        next.lemmas.unshift({
          id,
          lemma: candidate.lemma,
          partOfSpeech: candidate.partOfSpeech ?? "noun",
          occurrenceCount: candidate.frequency,
        });
      }
      continue;
    }

    if (candidate.type === "COLLOCATION") {
      if (!next.phrases.some((phrase) => phraseLookupKey(phrase.label) === phraseLookupKey(candidate.lemma))) {
        next.phrases.unshift({
          id,
          label: candidate.lemma,
          type: "COLLOCATION",
          occurrenceCount: candidate.frequency,
        });
      }
      continue;
    }

    if (candidate.type === "GRAMMAR") {
      if (
        !next.concepts.some(
          (concept) => phraseLookupKey(concept.title) === phraseLookupKey(candidate.lemma),
        )
      ) {
        next.concepts.unshift({
          id,
          conceptKey: candidate.lemma,
          title: candidate.lemma,
          category: "GRAMMAR",
        });
      }
      continue;
    }

    if (
      !next.phrases.some((phrase) => phraseLookupKey(phrase.label) === phraseLookupKey(candidate.lemma))
    ) {
      next.phrases.unshift({
        id,
        label: candidate.lemma,
        type: "NATIVE_CONSTRUCTION",
        occurrenceCount: candidate.frequency,
      });
    }
  }

  next.lemmas = next.lemmas.slice(0, limit);
  next.phrases = next.phrases.slice(0, limit);
  next.concepts = next.concepts.slice(0, limit);

  return next;
}

export async function universalSearch(query: string, limit = 8): Promise<KnowledgeSearchResult> {
  const results = await searchKnowledge(query, limit);
  return mergeCuratedResults(query, results, limit);
}

export type { KnowledgeSearchResult };
