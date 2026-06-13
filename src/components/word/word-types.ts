import type { PartOfSpeech } from "@/types";

export type WordPanelData = {
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
  frequencyTier: string | null;
};

export type NeighborWord = {
  original: string;
  partOfSpeech: string;
};

export type PhraseGroupPanelData = {
  type: string;
  label: string;
  explanation: string;
} | null;
