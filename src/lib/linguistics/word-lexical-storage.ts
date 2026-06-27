import type { WordAnalysisOutput } from "@/services/ai/schemas";

export function wordLexicalStorageFields(
  word: Pick<WordAnalysisOutput, "isProperNoun" | "lexicalType">,
) {
  return {
    isProperNoun: word.isProperNoun,
    lexicalType: word.lexicalType,
  };
}
