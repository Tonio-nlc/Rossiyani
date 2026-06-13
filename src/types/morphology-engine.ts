import type { PartOfSpeech } from "./domain";
import type { GraphConceptSummary } from "./knowledge-graph";

export type MorphologyEngineInput = {
  lemma: string;
  partOfSpeech: PartOfSpeech;
  ending: string;
  case?: string | null;
  original?: string;
  stem?: string;
  context?: {
    previousWord?: { original: string; partOfSpeech: string } | null;
    phraseLabel?: string | null;
  };
};

export type MorphologyEngineOutput = {
  stem: string;
  ending: string;
  reason: string;
  questionAnswered: string | null;
  preposition: string | null;
  canonicalExplanation: string;
  frenchComparison: string | null;
  relatedConcepts: GraphConceptSummary[];
  similarExamples: string[];
};
