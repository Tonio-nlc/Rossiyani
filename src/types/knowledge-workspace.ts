import type { PartOfSpeech, PhraseGroupType } from "./domain";
import type {
  EndingKnowledge,
  GraphConceptSummary,
  LemmaKnowledge,
  PhraseKnowledge,
  RelatedTextRef,
} from "./knowledge-graph";

/** Occurrence data from the current text (Word row). */
export type WordOccurrenceContext = {
  original: string;
  stressMarked: string;
  lemma: string;
  partOfSpeech: PartOfSpeech;
  stem: string;
  ending: string;
  case: string | null;
  gender: string | null;
  number: string | null;
  tense: string | null;
  aspect: string | null;
  explanation: string;
  frequency: string | null;
  /** Persisted AI gloss — null when not yet imported or unavailable. */
  translationCanonical?: string | null;
  translationAlternatives?: string[];
};

export type PhraseOccurrenceContext = {
  label: string;
  type: PhraseGroupType;
  explanation: string;
} | null;

export type NeighborWordContext = {
  original: string;
  partOfSpeech: string;
} | null;

export type FrenchComparisonView = {
  russianStructure: string;
  frenchStructure: string;
  whyDifferent: string;
};

/** Aggregated payload for Reader Knowledge Workspace panels. */
export type WordKnowledgeWorkspace = {
  occurrence: WordOccurrenceContext;
  contextLabel: string | null;
  lemmaKnowledge: LemmaKnowledge | null;
  endingKnowledge: EndingKnowledge | null;
  phraseKnowledge: PhraseKnowledge | null;
  phraseOccurrence: PhraseOccurrenceContext;
  concepts: GraphConceptSummary[];
  canonicalExplanation: string;
  grammaticalReason: string;
  frenchComparison: FrenchComparisonView | null;
  frenchComparisonCanonical: string | null;
  relatedTexts: RelatedTextRef[];
  libraryHitCount: number | null;
};

export type WordKnowledgeWorkspaceInput = WordOccurrenceContext & {
  previousWord?: NeighborWordContext;
  phraseOccurrence?: PhraseOccurrenceContext;
};
