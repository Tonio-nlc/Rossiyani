import type { PartOfSpeech } from "@/types/domain";
import type { WordDetailGraph } from "@/types/word-detail-graph";

export type ReaderWordSnapshot = {
  id: string;
  sentenceId: string;
  textId: string;
  position: number;
  original: string;
  stressMarked: string;
  stem: string;
  ending: string;
  partOfSpeech: PartOfSpeech;
  case: string | null;
  lemma: string;
  explanation: string;
  gender: string | null;
  number: string | null;
  tense: string | null;
  aspect: string | null;
  formId: string | null;
  literalTranslation: string | null;
  naturalTranslation: string | null;
};

export function isWordAnalysisComplete(detail: WordDetailGraph): boolean {
  return Boolean(detail.domain.form && detail.domain.lemma);
}

/** Client-side fallback when graph enrichment is missing or unavailable. */
export function buildMinimalWordDetail(word: ReaderWordSnapshot): WordDetailGraph {
  return {
    wordId: word.id,
    textId: word.textId,
    sentenceId: word.sentenceId,
    occurrence: {
      original: word.original,
      stressMarked: word.stressMarked,
      lemma: word.lemma,
      partOfSpeech: word.partOfSpeech,
      stem: word.stem,
      ending: word.ending,
      case: word.case,
      gender: word.gender,
      number: word.number,
      tense: word.tense,
      aspect: word.aspect,
      explanation: word.explanation,
      frequency: null,
      translationCanonical: null,
      translationAlternatives: [],
    },
    contextLabel: null,
    canonicalExplanation: word.explanation,
    grammaticalReason: word.explanation,
    frenchComparison: null,
    frenchComparisonCanonical: null,
    literalTranslation: word.literalTranslation,
    naturalTranslation: word.naturalTranslation,
    domain: {
      form: null,
      lemma: null,
      ending: null,
      case: null,
      concepts: [],
      expression: null,
      collocation: null,
    },
    lemmaKnowledge: null,
    endingKnowledge: null,
    phraseKnowledge: null,
    phraseOccurrence: null,
    concepts: [],
    relatedTexts: [],
    examples: [],
    statistics: {
      occurrenceCount: 0,
      seenInTexts: 0,
      libraryHitCount: null,
      collocationCount: null,
    },
    loadedSections: ["basic"],
  };
}
