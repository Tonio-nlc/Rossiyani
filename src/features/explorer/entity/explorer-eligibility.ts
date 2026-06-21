import type { KnowledgeConceptCategory, PhraseGroupType } from "@prisma/client";

import { phraseLookupKey } from "@/lib/normalization/russian-key";

const EXPLORER_PHRASE_TYPES = new Set<PhraseGroupType>([
  "FIXED_EXPRESSION",
  "NATIVE_CONSTRUCTION",
  "COLLOCATION",
]);

const MAX_WORDS: Record<PhraseGroupType, number> = {
  FIXED_EXPRESSION: 6,
  NATIVE_CONSTRUCTION: 5,
  COLLOCATION: 4,
};

const IDIOM_MARKERS =
  /\b(не|ни|что|как|бы|ли|же|то|это|чтобы|если|когда|пока|хотя|будто|словно|несмотря|благодаря|вопреки)\b|[-—–«»]/iu;

function wordCount(label: string): number {
  return label.trim().split(/\s+/).filter(Boolean).length;
}

function endsLikeSentence(label: string): boolean {
  return /[.!?…][\s"»'”]*$/.test(label.trim());
}

/**
 * Heuristic: three bare content words with no idiomatic marker → likely SVO chunk.
 */
function looksLikeArbitraryChunk(label: string): boolean {
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length !== 3) {
    return false;
  }
  if (IDIOM_MARKERS.test(label)) {
    return false;
  }
  return true;
}

function looksLikeFullSentence(label: string): boolean {
  const trimmed = label.trim();
  if (endsLikeSentence(trimmed)) {
    return true;
  }
  return wordCount(trimmed) > 8;
}

/**
 * Grammar cases live under /explorer/cases — not the Concepts category.
 */
export function isCaseConcept(conceptKey: string, category: KnowledgeConceptCategory | string): boolean {
  return conceptKey.includes("case:") || category === "GRAMMATICAL_CASE";
}

/**
 * Would a learner intentionally search for this phrase in Explorer?
 * Curated entries bypass this check at resolution time.
 */
export function isPhraseExplorerEligible(
  label: string,
  type: PhraseGroupType | string,
): boolean {
  const trimmed = label.trim();
  if (!trimmed) {
    return false;
  }

  if (!EXPLORER_PHRASE_TYPES.has(type as PhraseGroupType)) {
    return false;
  }

  const phraseType = type as PhraseGroupType;

  if (looksLikeFullSentence(trimmed)) {
    return false;
  }

  if (looksLikeArbitraryChunk(trimmed)) {
    return false;
  }

  const count = wordCount(trimmed);
  if (count < 1 || count > MAX_WORDS[phraseType]) {
    return false;
  }

  return true;
}

const PHRASE_DERIVED_CATEGORIES = new Set<KnowledgeConceptCategory>([
  "CONSTRUCTION",
  "GRAMMAR_PATTERN",
  "SEMANTIC",
]);

/**
 * Grammar cases and preposition patterns are always eligible.
 * Phrase-derived concepts require the underlying label to pass phrase eligibility.
 */
export function isConceptExplorerEligible(
  conceptKey: string,
  title: string,
  category: KnowledgeConceptCategory | string,
): boolean {
  if (isCaseConcept(conceptKey, category)) {
    return false;
  }

  if (category === "PREPOSITION_PATTERN") {
    return true;
  }

  if (PHRASE_DERIVED_CATEGORIES.has(category as KnowledgeConceptCategory)) {
    const inferredType: PhraseGroupType =
      category === "CONSTRUCTION"
        ? "NATIVE_CONSTRUCTION"
        : category === "GRAMMAR_PATTERN"
          ? "FIXED_EXPRESSION"
          : "COLLOCATION";
    return isPhraseExplorerEligible(title, inferredType);
  }

  return true;
}

export function isLemmaExplorerEligible(lemma: string): boolean {
  const trimmed = lemma.trim();
  if (!trimmed) {
    return false;
  }
  return wordCount(trimmed) === 1 && !endsLikeSentence(trimmed);
}

export function explorerHrefForPhrase(
  label: string,
  type: PhraseGroupType | string,
  href: string,
): string | null {
  return isPhraseExplorerEligible(label, type) ? href : null;
}

export function phraseKeysEquivalent(a: string, b: string): boolean {
  return phraseLookupKey(a) === phraseLookupKey(b);
}

/**
 * Server-side gate: curated entries always qualify for Explorer pages.
 */
export function isPhraseExplorerEligibleOrCurated(
  label: string,
  type: PhraseGroupType | string,
  isCurated: boolean,
): boolean {
  return isCurated || isPhraseExplorerEligible(label, type);
}

export function isConceptExplorerEligibleOrCurated(
  conceptKey: string,
  title: string,
  category: KnowledgeConceptCategory | string,
  isCurated: boolean,
): boolean {
  return isCurated || isConceptExplorerEligible(conceptKey, title, category);
}
