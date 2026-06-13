import type {
  CaseEntity,
  CollocationEntity,
  ConceptEntity,
  EndingEntity,
  ExpressionEntity,
  LemmaEntity,
  WordFormEntity,
} from "@/domain/entities";
import type {
  EndingKnowledge,
  GraphConceptSummary,
  LemmaKnowledge,
  PhraseKnowledge,
  RelatedTextRef,
} from "./knowledge-graph";
import type {
  FrenchComparisonView,
  PhraseOccurrenceContext,
  WordOccurrenceContext,
} from "./knowledge-workspace";

/** Progressive loading slices for GET /api/words/[id]. */
export type WordDetailSection =
  | "basic"
  | "concepts"
  | "examples"
  | "related"
  | "statistics"
  | "collocations";

export const WORD_DETAIL_SECTIONS: WordDetailSection[] = [
  "basic",
  "concepts",
  "examples",
  "related",
  "statistics",
  "collocations",
];

export const WORD_DETAIL_BASIC_SECTION: WordDetailSection = "basic";

export const WORD_DETAIL_ENRICHMENT_SECTIONS: WordDetailSection[] = [
  "concepts",
  "examples",
  "related",
  "statistics",
  "collocations",
];

/**
 * Unified domain graph for all Reader panels.
 * Single source of truth — panels must not derive business logic locally.
 */
export type WordDetailGraph = {
  wordId: string;
  textId: string;
  sentenceId: string;
  /** Occurrence in the current text (Word row). */
  occurrence: WordOccurrenceContext;
  contextLabel: string | null;
  canonicalExplanation: string;
  grammaticalReason: string;
  frenchComparison: FrenchComparisonView | null;
  frenchComparisonCanonical: string | null;
  /** Sentence-level literal French translation (context only — not word gloss). */
  literalTranslation: string | null;
  /** Sentence-level natural French translation (collapsed in analysis card). */
  naturalTranslation: string | null;
  /** Canonical domain entities resolved from KnowledgeGraph. */
  domain: {
    form: WordFormEntity | null;
    lemma: LemmaEntity | null;
    ending: EndingEntity | null;
    case: CaseEntity | null;
    concepts: ConceptEntity[];
    expression: ExpressionEntity | null;
    collocation: CollocationEntity | null;
  };
  /** Graph summaries for panels (may load progressively). */
  lemmaKnowledge: LemmaKnowledge | null;
  endingKnowledge: EndingKnowledge | null;
  phraseKnowledge: PhraseKnowledge | null;
  phraseOccurrence: PhraseOccurrenceContext;
  concepts: GraphConceptSummary[];
  relatedTexts: RelatedTextRef[];
  examples: string[];
  statistics: {
    occurrenceCount: number;
    seenInTexts: number;
    libraryHitCount: number | null;
    collocationCount: number | null;
  };
  loadedSections: WordDetailSection[];
};

export type WordDetailGraphResponse = {
  detail: WordDetailGraph;
};
