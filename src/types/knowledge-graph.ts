import type {
  KnowledgeConceptCategory,
  KnowledgeReviewStatus,
  PartOfSpeech,
  PhraseGroupType,
  WordFrequency,
  FrequencyTier,
} from "./domain";

export type GraphReviewStatus = KnowledgeReviewStatus;
export type GraphConceptCategory = KnowledgeConceptCategory;

export type GraphConceptSummary = {
  id: string;
  conceptKey: string;
  title: string;
  canonicalExplanation: string;
  category: GraphConceptCategory;
  frenchComparison: string | null;
  reviewStatus: GraphReviewStatus;
  hitCount: number;
};

export type GraphCaseSummary = {
  id: string;
  caseKey: string;
  titleFr: string;
  canonicalExplanation: string | null;
  hitCount: number;
  concept: GraphConceptSummary | null;
};

export type GraphFormSummary = {
  id: string;
  original: string;
  ending: string;
  case: string | null;
  explanation: string;
  canonicalExplanation: string | null;
  hitCount: number;
  occurrenceCount: number;
  stressMarked?: string;
  tense?: string | null;
  aspect?: string | null;
  gender?: string | null;
  number?: string | null;
};

export type GraphEndingSummary = {
  id: string;
  ending: string;
  caseKey: string;
  explanationFr: string;
  canonicalExplanation: string | null;
  hitCount: number;
};

export type GraphPhraseSummary = {
  id: string;
  label: string;
  type: PhraseGroupType;
  explanation: string;
  canonicalExplanation: string | null;
  hitCount: number;
  occurrenceCount: number;
};

export type GraphOccurrenceSummary = {
  id: string;
  sentenceRussian: string;
  naturalTranslation: string | null;
  textId: string | null;
  textTitle: string | null;
  wordPosition: number;
  explanationSnapshot: string;
  createdAt: string;
};

export type GraphPhraseOccurrenceSummary = {
  id: string;
  sentenceRussian: string;
  naturalTranslation: string | null;
  textId: string | null;
  textTitle: string | null;
  startPosition: number;
  endPosition: number;
  createdAt: string;
};

export type GraphLemmaNode = {
  id: string;
  lemma: string;
  partOfSpeech: PartOfSpeech;
  stressMarked: string;
  frequency: WordFrequency | null;
  frequencyTier: FrequencyTier | null;
  occurrenceCount: number;
  canonicalExplanation: string | null;
  frenchComparison: string | null;
  reviewStatus: GraphReviewStatus;
};

export type LemmaGraph = {
  lemma: GraphLemmaNode;
  forms: GraphFormSummary[];
  endings: GraphEndingSummary[];
  cases: GraphCaseSummary[];
  phrases: GraphPhraseSummary[];
  concepts: GraphConceptSummary[];
  occurrences: GraphOccurrenceSummary[];
  exampleSentences: string[];
  relatedConcepts: GraphConceptSummary[];
  familyLemmas: GraphLemmaNode[];
  aspectPartner: GraphLemmaNode | null;
  dominantAspect: string | null;
  stats: {
    formCount: number;
    occurrenceCount: number;
    distinctTexts: number;
  };
};

export type EndingGraph = {
  ending: GraphEndingSummary;
  forms: GraphFormSummary[];
  lemmas: GraphLemmaNode[];
  cases: GraphCaseSummary[];
  concepts: GraphConceptSummary[];
  occurrences: GraphOccurrenceSummary[];
  stats: {
    formCount: number;
    lemmaCount: number;
    occurrenceCount: number;
  };
};

export type CaseGraph = {
  caseNode: GraphCaseSummary;
  endings: GraphEndingSummary[];
  forms: GraphFormSummary[];
  lemmas: GraphLemmaNode[];
  concepts: GraphConceptSummary[];
  occurrences: GraphOccurrenceSummary[];
  stats: {
    endingCount: number;
    formCount: number;
    occurrenceCount: number;
  };
};

export type PhraseGraph = {
  phrase: GraphPhraseSummary;
  concepts: GraphConceptSummary[];
  occurrences: GraphPhraseOccurrenceSummary[];
  exampleSentences: string[];
  relatedLemmas: GraphLemmaNode[];
  stats: {
    occurrenceCount: number;
    distinctTexts: number;
  };
};

export type ConceptGraph = {
  concept: GraphConceptSummary;
  relatedConcepts: Array<GraphConceptSummary & { relationType: string }>;
  lemmas: GraphLemmaNode[];
  endings: GraphEndingSummary[];
  phrases: GraphPhraseSummary[];
  cases: GraphCaseSummary[];
  stats: {
    lemmaCount: number;
    endingCount: number;
    phraseCount: number;
  };
};

export type MergeOccurrenceInput = {
  analysis: import("./analysis").SentenceAnalysisOutput;
  textId: string;
  textTitle: string;
  sentenceId: string;
  words: Array<{ id: string; position: number; original: string }>;
};

export type MergeOccurrenceResult = {
  occurrencesCreated: number;
  occurrencesSkipped: number;
  phraseOccurrencesCreated: number;
  lemmasUpdated: number;
  conceptsLinked: number;
};

export type RelatedTextRef = {
  textId: string;
  textTitle: string;
  sentenceRussian: string;
};

export type LemmaTextRef = {
  textId: string;
  textTitle: string;
  sentenceRussian: string;
  occurrenceCount: number;
};

export type LemmaExampleRef = {
  id: string;
  sentenceRussian: string;
  naturalTranslation: string | null;
  textId: string | null;
  textTitle: string | null;
};

export type LemmaPhraseRef = {
  id: string;
  label: string;
  type: PhraseGroupType;
  occurrenceCount: number;
};

export type LemmaFamilyRef = {
  lemma: string;
  partOfSpeech: PartOfSpeech;
  occurrenceCount: number;
};

export type LemmaLessonRef = {
  title: string;
  slug: string;
  level: string;
};

/** Reader-facing knowledge payloads (features/knowledge). */
export type LemmaKnowledge = {
  lemma: string;
  partOfSpeech: PartOfSpeech;
  stressMarked: string | null;
  frequency: WordFrequency | null;
  frequencyTier: FrequencyTier | null;
  occurrenceCount: number;
  canonicalExplanation: string | null;
  frenchComparison: string | null;
  primaryTranslation: string | null;
  secondaryTranslations: string[];
  simpleExplanation: string | null;
  dominantAspect: string | null;
  aspectPartner: LemmaFamilyRef | null;
  forms: GraphFormSummary[];
  concepts: GraphConceptSummary[];
  relatedConcepts: GraphConceptSummary[];
  phrases: LemmaPhraseRef[];
  examples: LemmaExampleRef[];
  familyLemmas: LemmaFamilyRef[];
  exampleSentences: string[];
  seenInTexts: number;
  relatedTexts: RelatedTextRef[];
  textsWithStats: LemmaTextRef[];
  relatedLessons: LemmaLessonRef[];
};

export type EndingKnowledge = {
  ending: string;
  caseKey: string;
  canonicalExplanation: string | null;
  hitCount: number;
  concepts: GraphConceptSummary[];
  exampleForms: GraphFormSummary[];
};

export type ConceptKnowledge = ConceptGraph;

export type PhraseKnowledge = {
  label: string;
  type: PhraseGroupType;
  occurrenceCount: number;
  canonicalExplanation: string | null;
  concepts: GraphConceptSummary[];
  exampleSentences: string[];
  seenInTexts: number;
  relatedTexts: RelatedTextRef[];
};
