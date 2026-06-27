import type { PartOfSpeech } from "@prisma/client";

import { knowledgeGraphService } from "@/services/knowledge-graph";
import { pickCanonicalExplanation } from "@/services/knowledge-graph/graph-mappers";
import type { LemmaKnowledge } from "@/types/knowledge-graph";
import { lookupTextEditorialMeta } from "@/features/texts/lookup-text-editorial-meta";

import { findLemmaRelatedLessons } from "./find-lemma-related-lessons";
import { attachCollectionIds, groupLemmaTexts, mapLemmaExamples } from "./group-lemma-texts";
import { mapOccurrencesToRelatedTexts } from "./related-texts";
import {
  formatDominantAspectFr,
  parseLemmaMeanings,
  pickDisplayStress,
  pickSimpleExplanation,
} from "@/lib/explorer/lemma-display";

/**
 * Reader enrichment — lemma-centric knowledge from the KnowledgeGraph.
 * Optional; does not replace per-text Word rows.
 */
export async function getLemmaKnowledge(
  lemma: string,
  partOfSpeech: PartOfSpeech,
): Promise<LemmaKnowledge | null> {
  const graph = await knowledgeGraphService.getLemmaGraph(lemma, partOfSpeech);
  if (!graph) {
    return null;
  }

  const { primary, secondary } = parseLemmaMeanings(
    graph.lemma.frenchComparison,
    graph.lemma.partOfSpeech,
  );

  const allConcepts = [...graph.concepts];
  const conceptIds = new Set(graph.concepts.map((concept) => concept.id));
  for (const concept of graph.relatedConcepts) {
    if (!conceptIds.has(concept.id)) {
      allConcepts.push(concept);
      conceptIds.add(concept.id);
    }
  }

  const familyLemmas = graph.familyLemmas
    .filter((item) => item.lemma !== graph.lemma.lemma)
    .map((item) => ({
      lemma: item.lemma,
      partOfSpeech: item.partOfSpeech,
      occurrenceCount: item.occurrenceCount,
    }));

  const aspectPartner = graph.aspectPartner
    ? {
        lemma: graph.aspectPartner.lemma,
        partOfSpeech: graph.aspectPartner.partOfSpeech,
        occurrenceCount: graph.aspectPartner.occurrenceCount,
      }
    : null;

  const textIds = [
    ...new Set(
      graph.occurrences.map((occurrence) => occurrence.textId).filter(Boolean) as string[],
    ),
  ];
  const editorialMeta = await lookupTextEditorialMeta(textIds);
  const examples = attachCollectionIds(mapLemmaExamples(graph.occurrences), editorialMeta);
  const textsWithStats = attachCollectionIds(groupLemmaTexts(graph.occurrences), editorialMeta);
  const relatedTexts = attachCollectionIds(
    mapOccurrencesToRelatedTexts(graph.occurrences),
    editorialMeta,
  );

  return {
    lemma: graph.lemma.lemma,
    partOfSpeech: graph.lemma.partOfSpeech,
    isProperNoun: graph.lemma.isProperNoun,
    lexicalType: graph.lemma.lexicalType,
    stressMarked: pickDisplayStress(graph.lemma.stressMarked, graph.lemma.lemma),
    frequency: graph.lemma.frequency,
    frequencyTier: graph.lemma.frequencyTier,
    occurrenceCount: graph.stats.occurrenceCount,
    canonicalExplanation: graph.lemma.canonicalExplanation,
    frenchComparison: graph.lemma.frenchComparison,
    primaryTranslation: primary,
    secondaryTranslations: secondary,
    simpleExplanation: pickSimpleExplanation(graph.lemma.canonicalExplanation, primary),
    dominantAspect: formatDominantAspectFr(graph.dominantAspect),
    aspectPartner,
    forms: graph.forms.map((form) => ({
      ...form,
      explanation: pickCanonicalExplanation(form.canonicalExplanation, form.explanation),
    })),
    concepts: graph.concepts,
    relatedConcepts: graph.relatedConcepts,
    phrases: graph.phrases.map((phrase) => ({
      id: phrase.id,
      label: phrase.label,
      type: phrase.type,
      occurrenceCount: phrase.occurrenceCount,
    })),
    examples,
    familyLemmas,
    exampleSentences: graph.exampleSentences,
    seenInTexts: graph.stats.distinctTexts,
    relatedTexts,
    textsWithStats,
    relatedLessons: findLemmaRelatedLessons(graph.lemma.lemma, allConcepts),
  };
}
