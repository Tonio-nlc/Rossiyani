import { normalizeForWordFormCompare } from "@/lib/formatting/word-form";
import type { PartOfSpeech } from "@/types/domain";
import type { WordOccurrenceContext } from "@/types/knowledge-workspace";
import type { WordDetailGraph } from "@/types/word-detail-graph";

const MASCULINE_A_ENDING_LEMMAS = new Set([
  "папа",
  "дедушка",
  "мужчина",
  "слуга",
  "кофе",
  "буфет",
  "шофёр",
  "шофер",
]);

function inferGenderFromLemma(lemma: string, partOfSpeech: PartOfSpeech): string | null {
  if (partOfSpeech !== "noun" && partOfSpeech !== "adjective") {
    return null;
  }

  const key = lemma.trim().toLowerCase().replace(/ё/g, "е");
  if (MASCULINE_A_ENDING_LEMMAS.has(key)) {
    return "masculine";
  }

  if (key.endsWith("я") || key.endsWith("а")) {
    return "feminine";
  }

  if (key.endsWith("о") || key.endsWith("е") || key.endsWith("мя")) {
    return "neuter";
  }

  return null;
}

/** Gender for display — KnowledgeForm first, then lemma morphology, then occurrence. */
export function resolveEffectiveGender(
  occurrence: WordOccurrenceContext,
  detail?: Pick<WordDetailGraph, "domain">,
): string | null {
  const form = detail?.domain.form;
  if (
    form?.gender &&
    normalizeForWordFormCompare(form.original) === normalizeForWordFormCompare(occurrence.original)
  ) {
    return form.gender;
  }

  const inferred = inferGenderFromLemma(occurrence.lemma, occurrence.partOfSpeech);
  if (inferred) {
    return inferred;
  }

  return occurrence.gender;
}
