import type {
  KnowledgeCase,
  KnowledgeConcept,
  KnowledgeEnding,
  KnowledgeForm,
  KnowledgeLemma,
  KnowledgeOccurrence,
  KnowledgePhrase,
  KnowledgePhraseOccurrence,
} from "@prisma/client";

import type {
  GraphCaseSummary,
  GraphConceptSummary,
  GraphEndingSummary,
  GraphFormSummary,
  GraphLemmaNode,
  GraphOccurrenceSummary,
  GraphPhraseOccurrenceSummary,
  GraphPhraseSummary,
} from "@/types/knowledge-graph";

export function mapConceptRow(row: KnowledgeConcept): GraphConceptSummary {
  return {
    id: row.id,
    conceptKey: row.conceptKey,
    title: row.title,
    canonicalExplanation: row.canonicalExplanation,
    category: row.category,
    frenchComparison: row.frenchComparison,
    reviewStatus: row.reviewStatus,
    hitCount: row.hitCount,
  };
}

export function mapLemmaRow(row: KnowledgeLemma): GraphLemmaNode {
  return {
    id: row.id,
    lemma: row.lemma,
    partOfSpeech: row.partOfSpeech,
    stressMarked: row.stressMarked,
    frequency: row.frequency,
    frequencyTier: row.frequencyTier,
    occurrenceCount: row.occurrenceCount,
    canonicalExplanation: row.canonicalExplanation,
    frenchComparison: row.frenchComparison,
    reviewStatus: row.reviewStatus,
  };
}

export function mapFormRow(row: KnowledgeForm): GraphFormSummary {
  return {
    id: row.id,
    original: row.original,
    ending: row.ending,
    case: row.case,
    explanation: row.explanation,
    canonicalExplanation: row.canonicalExplanation,
    hitCount: row.hitCount,
    occurrenceCount: row.occurrenceCount,
    stressMarked: row.stressMarked,
    tense: row.tense,
    aspect: row.aspect,
    gender: row.gender,
    number: row.number,
  };
}

export function mapEndingRow(row: KnowledgeEnding): GraphEndingSummary {
  return {
    id: row.id,
    ending: row.ending,
    caseKey: row.caseKey,
    explanationFr: row.explanationFr,
    canonicalExplanation: row.canonicalExplanation,
    hitCount: row.hitCount,
  };
}

export function mapPhraseRow(row: KnowledgePhrase): GraphPhraseSummary {
  return {
    id: row.id,
    label: row.label,
    type: row.type,
    explanation: row.explanation,
    canonicalExplanation: row.canonicalExplanation,
    hitCount: row.hitCount,
    occurrenceCount: row.occurrenceCount,
  };
}

export function mapCaseRow(
  row: KnowledgeCase,
  concept: KnowledgeConcept | null,
): GraphCaseSummary {
  return {
    id: row.id,
    caseKey: row.caseKey,
    titleFr: row.titleFr,
    canonicalExplanation: row.canonicalExplanation,
    hitCount: row.hitCount,
    concept: concept ? mapConceptRow(concept) : null,
  };
}

export function mapOccurrenceRow(row: KnowledgeOccurrence): GraphOccurrenceSummary {
  return {
    id: row.id,
    sentenceRussian: row.sentenceRussian,
    naturalTranslation: row.naturalTranslation,
    textId: row.textId,
    textTitle: row.textTitle,
    wordPosition: row.wordPosition,
    explanationSnapshot: row.explanationSnapshot,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapPhraseOccurrenceRow(
  row: KnowledgePhraseOccurrence,
): GraphPhraseOccurrenceSummary {
  return {
    id: row.id,
    sentenceRussian: row.sentenceRussian,
    naturalTranslation: row.naturalTranslation,
    textId: row.textId,
    textTitle: row.textTitle,
    startPosition: row.startPosition,
    endPosition: row.endPosition,
    createdAt: row.createdAt.toISOString(),
  };
}

export function pickCanonicalExplanation(
  canonical: string | null | undefined,
  fallback: string,
): string {
  return canonical && canonical.trim().length > 0 ? canonical : fallback;
}
