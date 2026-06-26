export const VOCABULARY_HOME = "/vocabulary" as const;

export type VocabularyTab = "words" | "expressions" | "sentences";

export function vocabularyPath(tab?: VocabularyTab): string {
  if (!tab || tab === "words") {
    return VOCABULARY_HOME;
  }
  return `${VOCABULARY_HOME}?tab=${tab}`;
}

export function parseVocabularyTab(value: string | null): VocabularyTab {
  if (value === "expressions" || value === "sentences") {
    return value;
  }
  return "words";
}

export {
  formatRelativeEncounter,
  formatVocabularyDate,
  vocabularyExpressionPath,
  vocabularySentencePath,
  vocabularyWordPath,
} from "./card-utils";
