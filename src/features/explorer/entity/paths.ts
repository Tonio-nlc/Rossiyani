import type { FeaturedCandidateType, PartOfSpeech } from "@prisma/client";

import {
  collocationPath,
  conceptPath,
  expressionPath,
  lemmaPath,
} from "@/components/explorer/explorer-routes";
import type { FeaturedCandidateRow } from "@/features/discovery/types";

export function curatedCandidateHref(candidate: FeaturedCandidateRow): string {
  if (candidate.explorerHref) {
    return candidate.explorerHref;
  }

  switch (candidate.type) {
    case "WORD":
      return lemmaPath(candidate.lemma, candidate.partOfSpeech ?? "noun");
    case "COLLOCATION":
      return collocationPath(candidate.lemma);
    case "GRAMMAR":
      return conceptPath(candidate.lemma);
    case "EXPRESSION":
    case "CONSTRUCTION":
    case "CONVERSATION":
    case "NATIVE_PHRASE":
    case "SLANG":
    case "REGIONAL":
      return expressionPath(candidate.lemma);
    default:
      return `/explorer?q=${encodeURIComponent(candidate.lemma)}`;
  }
}

export function phraseRouteForType(
  label: string,
  type: string,
  routeHint?: "collocation" | "expression",
): string {
  if (type === "COLLOCATION" || routeHint === "collocation") {
    return collocationPath(label);
  }
  if (routeHint === "expression" || type !== "COLLOCATION") {
    return expressionPath(label);
  }
  return collocationPath(label);
}

export const CURATED_TYPE_LABELS: Record<FeaturedCandidateType, string> = {
  WORD: "Word",
  EXPRESSION: "Expression",
  CONSTRUCTION: "Construction",
  COLLOCATION: "Collocation",
  GRAMMAR: "Grammar",
  SLANG: "Slang",
  CONVERSATION: "Conversation",
  REGIONAL: "Regional",
  NATIVE_PHRASE: "Native expression",
};

export const GENERIC_PHRASE_DESCRIPTIONS: Record<string, string> = {
  COLLOCATION: "Common Russian collocation used in everyday language.",
  FIXED_EXPRESSION: "Native Russian expression used in authentic speech.",
  NATIVE_CONSTRUCTION: "Native Russian construction used in everyday language.",
  CONSTRUCTION: "Common Russian construction used in everyday language.",
  EXPRESSION: "Native Russian expression used in authentic speech.",
  NATIVE_PHRASE: "Native Russian expression used in authentic speech.",
  SLANG: "Colloquial Russian expression used in informal speech.",
  CONVERSATION: "Everyday Russian phrase used in conversation.",
  REGIONAL: "Regional Russian expression with a distinct local flavor.",
  WORD: "Russian word used in authentic texts and everyday speech.",
  GRAMMAR: "Grammar pattern that shapes how Russian works in practice.",
};

export function genericDescriptionForCurated(candidate: FeaturedCandidateRow): string {
  return (
    GENERIC_PHRASE_DESCRIPTIONS[candidate.type] ??
    "A living piece of Russian — explore examples, related forms, and practice."
  );
}

export function genericDescriptionForPhraseType(type: string): string {
  return (
    GENERIC_PHRASE_DESCRIPTIONS[type] ??
    "Common Russian phrase used in everyday language."
  );
}

export function partOfSpeechFallback(pos?: PartOfSpeech | null): PartOfSpeech {
  return pos ?? "noun";
}
