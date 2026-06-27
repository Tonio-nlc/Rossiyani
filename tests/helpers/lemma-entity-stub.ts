import type { LemmaEntity } from "@/domain/entities/lemma";
import type { LexicalType, PartOfSpeech } from "@/types/domain";

export function stubLemmaEntity(
  overrides: Partial<LemmaEntity> & Pick<LemmaEntity, "id" | "lemma" | "partOfSpeech">,
): LemmaEntity {
  const partOfSpeech = overrides.partOfSpeech;
  const isProperNoun = overrides.isProperNoun ?? false;
  const lexicalType: LexicalType | null =
    overrides.lexicalType ??
    (isProperNoun ? "proper_noun" : partOfSpeech === "noun" ? "common_noun" : null);

  return {
    stressMarked: overrides.lemma,
    frequency: null,
    frequencyTier: null,
    occurrenceCount: 1,
    canonicalExplanation: null,
    frenchComparison: null,
    reviewStatus: "CANONICAL",
    isProperNoun,
    lexicalType,
    ...overrides,
  };
}
