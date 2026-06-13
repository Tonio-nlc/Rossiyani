import type { PartOfSpeech } from "@/types/domain";

import type { SentenceBlockWord } from "../sentence/sentence-block";

export function createOrphanWord(
  sentenceId: string,
  segment: { position: number; text: string },
): SentenceBlockWord {
  return {
    id: `orphan:${sentenceId}:${segment.position}:${segment.text}`,
    position: segment.position,
    original: segment.text,
    stressMarked: segment.text,
    stem: segment.text,
    ending: "",
    partOfSpeech: "particle",
    case: null,
    lemma: segment.text,
    explanation: "",
    formId: null,
  };
}

export function resolveSentenceBlockWord(
  sentenceId: string,
  segment: { position: number; text: string },
  wordByPosition: Map<number, SentenceBlockWord>,
): SentenceBlockWord {
  return (
    wordByPosition.get(segment.position) ??
    createOrphanWord(sentenceId, segment)
  );
}

export type ReaderWordSnapshotInput = SentenceBlockWord & {
  sentenceId: string;
  textId: string;
  literalTranslation: string | null;
  naturalTranslation: string | null;
  gender?: string | null;
  number?: string | null;
  tense?: string | null;
  aspect?: string | null;
};

export function toReaderWordSnapshot(word: ReaderWordSnapshotInput) {
  return {
    id: word.id,
    sentenceId: word.sentenceId,
    textId: word.textId,
    position: word.position,
    original: word.original,
    stressMarked: word.stressMarked,
    stem: word.stem,
    ending: word.ending,
    partOfSpeech: word.partOfSpeech as PartOfSpeech,
    case: word.case,
    lemma: word.lemma,
    explanation: word.explanation,
    gender: word.gender ?? null,
    number: word.number ?? null,
    tense: word.tense ?? null,
    aspect: word.aspect ?? null,
    formId: word.formId ?? null,
    literalTranslation: word.literalTranslation,
    naturalTranslation: word.naturalTranslation,
  };
}
