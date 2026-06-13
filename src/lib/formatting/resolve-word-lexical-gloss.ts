import { resolveWordSemanticData, type WordTranslationSource } from "@/lib/formatting/resolve-word-semantic-data";
import { splitLexicalMeanings } from "@/lib/formatting/lexical-meanings";
import type { WordDetailGraph } from "@/types/word-detail-graph";

export type { WordTranslationSource };

export type WordLexicalGlossResult = {
  value: string;
  source: WordTranslationSource;
  isEstimated: boolean;
};

export { splitLexicalMeanings };

/** @internal Prefer resolveWordSemanticData() in UI code. */
export function resolveWordLexicalGlossResult(detail: WordDetailGraph): WordLexicalGlossResult {
  const semantic = resolveWordSemanticData(detail);
  return {
    value: semantic.translation,
    source: semantic.translationSource,
    isEstimated: semantic.estimated,
  };
}

export function resolveWordLexicalGloss(detail: WordDetailGraph): string {
  return resolveWordSemanticData(detail).translation;
}

export function resolveWordLexicalMeanings(detail: WordDetailGraph): {
  primaryMeanings: string[];
  extraMeanings: string[];
  isEstimated: boolean;
  source: WordTranslationSource;
} {
  const semantic = resolveWordSemanticData(detail);
  return {
    primaryMeanings: semantic.primaryMeanings,
    extraMeanings: semantic.extraMeanings,
    isEstimated: semantic.estimated,
    source: semantic.translationSource,
  };
}
