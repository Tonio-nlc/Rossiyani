import type { LexicalType, PartOfSpeech } from "@/types/domain";

const PROPER_NOUN_POS = new Set([
  "proper noun",
  "proper_noun",
  "proper-noun",
  "propn",
  "name",
]);

export const LEXICAL_TYPES = [
  "common_noun",
  "proper_noun",
  "verb",
  "adjective",
  "pronoun",
  "numeral",
  "particle",
  "interjection",
  "abbreviation",
  "other",
] as const satisfies readonly LexicalType[];

/** True when raw AI / morphological POS marks a proper noun. */
export function isProperNounPartOfSpeech(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }
  const key = value.trim().toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ");
  return PROPER_NOUN_POS.has(key) || PROPER_NOUN_POS.has(key.replace(/ /g, "_"));
}

export function partOfSpeechToLexicalType(
  partOfSpeech: PartOfSpeech,
  isProperNoun: boolean,
): LexicalType {
  if (isProperNoun) {
    return "proper_noun";
  }

  switch (partOfSpeech) {
    case "noun":
      return "common_noun";
    case "verb":
      return "verb";
    case "adjective":
      return "adjective";
    case "pronoun":
      return "pronoun";
    case "numeral":
      return "numeral";
    case "particle":
      return "particle";
    case "interjection":
      return "interjection";
    default:
      return "other";
  }
}

export function resolveWordLexicalMetadata(input: {
  partOfSpeech: PartOfSpeech;
  isProperNoun?: boolean | null;
  lexicalType?: LexicalType | null;
}): { isProperNoun: boolean; lexicalType: LexicalType } {
  const isProperNoun = input.isProperNoun === true;
  const lexicalType =
    input.lexicalType ??
    (isProperNoun ? "proper_noun" : partOfSpeechToLexicalType(input.partOfSpeech, false));

  return {
    isProperNoun,
    lexicalType: isProperNoun ? "proper_noun" : lexicalType,
  };
}

/** Learnable vocabulary excludes encyclopedic proper names. */
export function isLearnableLemma(meta: { isProperNoun?: boolean | null }): boolean {
  return meta.isProperNoun !== true;
}

/** Prisma filter — corpus stats and browse lists for learnable lemmas only. */
export const LEARNABLE_LEMMA_WHERE = {
  isProperNoun: { not: true },
} as const;

export function countLearnableWordsSeen(progress: {
  wordsSeenIds: string[];
  learnableWordsSeenIds?: string[];
}): number {
  if (progress.learnableWordsSeenIds) {
    return progress.learnableWordsSeenIds.length;
  }
  return progress.wordsSeenIds.length;
}
