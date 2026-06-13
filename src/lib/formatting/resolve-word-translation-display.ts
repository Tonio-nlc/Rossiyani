import type { PartOfSpeech } from "@/types/domain";
import type { WordDetailGraph } from "@/types/word-detail-graph";

import {
  resolveWordSemanticData,
  type WordTranslationSource,
} from "./resolve-word-semantic-data";

export type WordTranslationDisplay = {
  primaryMeanings: string[];
  extraMeanings: string[];
  posEmoji: string | null;
  isEstimated: boolean;
  source: WordTranslationSource;
  confidence: number;
};

/** @internal UI should prefer resolveWordSemanticData(). */
export function resolveWordTranslationDisplay(detail: WordDetailGraph): WordTranslationDisplay {
  const semantic = resolveWordSemanticData(detail);

  return {
    primaryMeanings: semantic.primaryMeanings,
    extraMeanings: semantic.extraMeanings,
    posEmoji: semantic.posEmoji,
    isEstimated: semantic.estimated,
    source: semantic.translationSource,
    confidence: semantic.confidence,
  };
}

export function translationSourceBadgeLabel(
  source: WordTranslationSource,
  isEstimated: boolean,
): string {
  if (source === "none") {
    return "";
  }
  if (isEstimated) {
    return "≈ dictionnaire local";
  }
  switch (source) {
    case "KnowledgeForm":
    case "KnowledgeLemma":
      return "✓ dictionnaire";
    case "word":
      return "✓ traduction";
    default:
      return "✓ traduction";
  }
}

export const POS_EMOJI: Partial<Record<PartOfSpeech, string>> = {
  noun: "🌳",
  adjective: "❄",
  verb: "▶",
};
