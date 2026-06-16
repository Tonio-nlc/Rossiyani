import {
  isPhraseSaved,
  savePhrase,
  type SavedPhraseRewriteType,
} from "@/features/library/saved-phrases-storage";

import type { ContextTranslationAlternative, ContextTranslationRegister } from "./types";

function registerToRewriteType(register: ContextTranslationRegister): SavedPhraseRewriteType {
  switch (register) {
    case "spoken":
    case "informal":
      return "conversational";
    case "literary":
      return "literary";
    case "formal":
      return "alternative";
    default:
      return "natural";
  }
}

export function isContextTranslationPhraseSaved(
  sourceSentence: string,
  russianPhrase: string,
): boolean {
  return isPhraseSaved(sourceSentence, russianPhrase);
}

export function saveContextTranslationPhrase(input: {
  sourceSentence: string;
  russianPhrase: string;
  register?: ContextTranslationRegister;
  nuance?: string;
}): void {
  savePhrase({
    originalSentence: input.sourceSentence,
    rewrittenSentence: input.russianPhrase,
    rewriteType: registerToRewriteType(input.register ?? "neutral"),
    explanation: input.nuance ?? "",
    structures: [],
    source: "context-translation",
  });
}

export function saveContextTranslationAlternative(
  sourceSentence: string,
  alternative: ContextTranslationAlternative,
): void {
  saveContextTranslationPhrase({
    sourceSentence,
    russianPhrase: alternative.text,
    register: alternative.register,
    nuance: alternative.nuance,
  });
}
