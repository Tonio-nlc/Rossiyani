import { reconcileWordStem } from "@/lib/formatting/word-form";
import { extractWordTranslationFromRaw } from "@/lib/import/word-translation";

import type { PhraseGroupAnalysisOutput } from "./schemas";

type RawWord = Record<string, unknown>;

type RawPhraseGroup = {
  type?: unknown;
  label?: unknown;
  explanation?: unknown;
  startPosition?: unknown;
  endPosition?: unknown;
  indices?: unknown;
};

type RawSentence = Record<string, unknown> & {
  words?: unknown;
  phraseGroups?: unknown;
};

/**
 * Normalizes AI JSON toward the canonical schema before Zod validation.
 * Does not change business rules — only repairs common model shape drift.
 */
export function normalizeAnalysisPayload(data: unknown): unknown {
  if (!data || typeof data !== "object") {
    return data;
  }

  const raw = data as RawSentence;
  const words = normalizeWords(raw.words);
  const phraseGroups = normalizePhraseGroups(raw.phraseGroups, words);

  return {
    ...raw,
    words,
    phraseGroups,
  };
}

function normalizeWords(words: unknown): RawWord[] {
  if (!Array.isArray(words)) {
    return [];
  }

  return words.map((item) => {
    if (!item || typeof item !== "object") {
      return item as RawWord;
    }
    const word = { ...(item as RawWord) };
    const original = String(word.original ?? "");
    const ending = String(word.ending ?? "");
    const stem = String(word.stem ?? "");
    word.partOfSpeech = normalizePartOfSpeechValue(word.partOfSpeech);
    word.stem = reconcileWordStem(original, stem, ending);
    const { translationCanonical, translationAlternatives } = extractWordTranslationFromRaw(word);
    if (translationCanonical) {
      word.translationCanonical = translationCanonical;
    }
    if (translationAlternatives.length > 0) {
      word.translationAlternatives = translationAlternatives;
    }
    return word;
  });
}

function normalizePhraseGroups(
  phraseGroups: unknown,
  words: RawWord[],
): PhraseGroupAnalysisOutput[] {
  if (!Array.isArray(phraseGroups)) {
    return [];
  }

  const sortedWords = [...words]
    .filter((w) => typeof w.position === "number" && typeof w.original === "string")
    .sort((a, b) => (a.position as number) - (b.position as number));

  return phraseGroups
    .map((item) => normalizePhraseGroup(item as RawPhraseGroup, sortedWords))
    .filter((g): g is PhraseGroupAnalysisOutput => g !== null);
}

function normalizePhraseGroup(
  raw: RawPhraseGroup,
  words: RawWord[],
): PhraseGroupAnalysisOutput | null {
  const type = raw.type;
  const explanation = raw.explanation;
  if (typeof type !== "string" || typeof explanation !== "string") {
    return null;
  }

  let startPosition: number;
  let endPosition: number;

  if (
    typeof raw.startPosition === "number" &&
    typeof raw.endPosition === "number"
  ) {
    startPosition = raw.startPosition;
    endPosition = raw.endPosition;
  } else if (Array.isArray(raw.indices) && raw.indices.length >= 2) {
    const indices = raw.indices.filter((i): i is number => typeof i === "number");
    if (indices.length < 2) {
      return null;
    }
    startPosition = Math.min(...indices);
    endPosition = Math.max(...indices);
  } else {
    return null;
  }

  const label =
    typeof raw.label === "string" && raw.label.length > 0
      ? raw.label
      : buildPhraseGroupLabel(words, startPosition, endPosition);

  return {
    type: type as PhraseGroupAnalysisOutput["type"],
    label,
    explanation,
    startPosition,
    endPosition,
  };
}

function buildPhraseGroupLabel(
  words: RawWord[],
  startPosition: number,
  endPosition: number,
): string {
  return words
    .filter((w) => {
      const pos = w.position as number;
      return pos >= startPosition && pos <= endPosition;
    })
    .map((w) => String(w.original))
    .join(" ");
}

function normalizePartOfSpeechValue(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  const key = value.trim().toLowerCase().replace(/-/g, " ");
  if (key === "proper noun" || key === "proper_noun" || key === "name" || key === "propn") {
    return "noun";
  }
  return value.trim().toLowerCase();
}
