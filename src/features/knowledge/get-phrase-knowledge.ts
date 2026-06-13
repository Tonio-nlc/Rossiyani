import { knowledgeGraphService } from "@/services/knowledge-graph";
import { pickCanonicalExplanation } from "@/services/knowledge-graph/graph-mappers";
import type { PhraseKnowledge } from "@/types/knowledge-graph";

import { mapOccurrencesToRelatedTexts } from "./related-texts";

/**
 * Reader enrichment — collocation / construction knowledge from the KnowledgeGraph.
 */
export async function getPhraseKnowledge(label: string): Promise<PhraseKnowledge | null> {
  const graph = await knowledgeGraphService.getPhraseGraph(label);
  if (!graph) {
    return null;
  }

  return {
    label: graph.phrase.label,
    type: graph.phrase.type,
    occurrenceCount: graph.stats.occurrenceCount,
    canonicalExplanation: pickCanonicalExplanation(
      graph.phrase.canonicalExplanation,
      graph.phrase.explanation,
    ),
    concepts: graph.concepts,
    exampleSentences: graph.exampleSentences,
    seenInTexts: graph.stats.distinctTexts,
    relatedTexts: mapOccurrencesToRelatedTexts(graph.occurrences),
  };
}
