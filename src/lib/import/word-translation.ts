import { lookupEstimatedGloss } from "@/lib/formatting/estimate-word-translation";
import {
  LEXICAL_TRANSLATION_EMPTY,
  validateLexicalTranslation,
} from "@/lib/formatting/lexical-validation";

const TRANSLATION_FIELD_KEYS = [
  "translationCanonical",
  "translation",
  "frenchTranslation",
  "gloss",
  "meaning",
] as const;

export type ExtractedWordTranslation = {
  translationCanonical: string | null;
  translationAlternatives: string[];
};

function acceptTranslation(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }
  const validation = validateLexicalTranslation(value.trim());
  return validation.accepted ? value.trim() : null;
}

/** Normalizes AI word JSON drift into canonical translation fields. */
export function extractWordTranslationFromRaw(
  raw: Record<string, unknown>,
): ExtractedWordTranslation {
  let translationCanonical: string | null = null;

  for (const key of TRANSLATION_FIELD_KEYS) {
    const candidate = acceptTranslation(
      typeof raw[key] === "string" ? (raw[key] as string) : null,
    );
    if (candidate) {
      translationCanonical = candidate;
      break;
    }
  }

  const translationAlternatives: string[] = [];
  const altRaw = raw.translationAlternatives ?? raw.alternatives ?? raw.otherMeanings;
  if (Array.isArray(altRaw)) {
    for (const item of altRaw) {
      const accepted = acceptTranslation(typeof item === "string" ? item : null);
      if (accepted && accepted !== translationCanonical) {
        translationAlternatives.push(accepted);
      }
    }
  }

  return { translationCanonical, translationAlternatives };
}

export function lookupDictionaryTranslation(original: string, lemma: string): string | null {
  for (const key of [original, lemma]) {
    const hit = acceptTranslation(lookupEstimatedGloss(key));
    if (hit) {
      return hit;
    }
  }
  return null;
}

/** Import-time resolution mirroring UI priority: stored → KG → dictionary → — */
export function resolveImportWordTranslation(input: {
  storedTranslation: string | null;
  knowledgeTranslation: string | null;
  dictionaryTranslation: string | null;
}): string {
  return (
    acceptTranslation(input.storedTranslation) ??
    acceptTranslation(input.knowledgeTranslation) ??
    acceptTranslation(input.dictionaryTranslation) ??
    LEXICAL_TRANSLATION_EMPTY
  );
}

export type WordTranslationPersistInput = Pick<
  import("@/services/ai/schemas").WordAnalysisOutput,
  "translationCanonical" | "translationAlternatives"
>;

export function wordTranslationForStorage(
  word: WordTranslationPersistInput,
): {
  translationCanonical: string | null;
  translationAlternatives: string[] | undefined;
} {
  const translationCanonical = acceptTranslation(word.translationCanonical ?? null);
  const translationAlternatives =
    word.translationAlternatives
      ?.map((alt) => acceptTranslation(alt))
      .filter((alt): alt is string => Boolean(alt)) ?? [];

  return {
    translationCanonical,
    translationAlternatives:
      translationAlternatives.length > 0 ? translationAlternatives : undefined,
  };
}
