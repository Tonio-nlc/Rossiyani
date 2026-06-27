import type { FrequencyTier, LexicalType, PartOfSpeech, PhraseGroupType, WordFrequency } from "./domain";
import type { SentenceAnalysisOutput } from "./analysis";

/** Result of a sentence-level knowledge lookup. */
export type KnowledgeSentenceLookupResult = {
  hit: boolean;
  complete: boolean;
  analysis: SentenceAnalysisOutput | null;
  source: "cache" | "partial" | "miss";
};

export type KnowledgeLemmaRecord = {
  id: string;
  lemma: string;
  partOfSpeech: PartOfSpeech;
  isProperNoun: boolean | null;
  lexicalType: LexicalType | null;
  stressMarked: string;
  frequency: WordFrequency | null;
  frequencyTier: FrequencyTier | null;
};

export type KnowledgeFormRecord = {
  id: string;
  lemmaId: string;
  original: string;
  stressMarked: string;
  stem: string;
  ending: string;
  partOfSpeech: PartOfSpeech;
  case: string | null;
  gender: string | null;
  number: string | null;
  tense: string | null;
  aspect: string | null;
  explanation: string;
  hitCount: number;
  lemma?: KnowledgeLemmaRecord;
};

export type KnowledgeEndingRecord = {
  id: string;
  ending: string;
  caseKey: string;
  partOfSpeech: PartOfSpeech | null;
  explanationFr: string;
  hitCount: number;
};

export type KnowledgePhraseRecord = {
  id: string;
  label: string;
  type: PhraseGroupType;
  explanation: string;
  hitCount: number;
};

/** Reader enrichment — optional, does not replace per-text Word data. */
export type WordKnowledgeContext = {
  fromLibrary: true;
  formHitCount: number;
  canonicalExplanation: string;
  lemma: string;
  knownEnding: KnowledgeEndingRecord | null;
  relatedPhrase: KnowledgePhraseRecord | null;
};

export type KnowledgeFormLookupResult = KnowledgeFormRecord;
export type KnowledgePhraseLookupResult = KnowledgePhraseRecord;
export type KnowledgeEndingLookupResult = KnowledgeEndingRecord;

export type IndexAnalysisResult = {
  sentenceCached: boolean;
  formsIndexed: number;
  lemmasIndexed: number;
  endingsIndexed: number;
  phrasesIndexed: number;
};
