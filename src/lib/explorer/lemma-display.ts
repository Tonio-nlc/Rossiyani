import { POS_LABELS_FR, formatCaseLabelFr } from "@/features/grammar";
import { LEXICAL_TRANSLATION_PLACEHOLDER } from "@/features/grammar/french-comparison";
import { splitLexicalMeanings } from "@/lib/formatting/lexical-meanings";
import { validateLexicalTranslation } from "@/lib/formatting/lexical-validation";
import { isDisplayableUiText, isDisplayableMorphologyValue } from "@/lib/formatting/ui-placeholder-guard";
import {
  formatAspectFr,
  formatTenseFr,
} from "@/lib/formatting/word-morphology-display";
import type { FrequencyTier, PartOfSpeech, WordFrequency } from "@/types/domain";
import type { GraphFormSummary } from "@/types/knowledge-graph";

export function formatPosLabelFr(partOfSpeech: PartOfSpeech): string {
  const label = POS_LABELS_FR[partOfSpeech] ?? partOfSpeech;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function pickLemmaTranslation(
  frenchComparison: string | null | undefined,
): string | null {
  const trimmed = frenchComparison?.trim();
  if (!trimmed || trimmed === LEXICAL_TRANSLATION_PLACEHOLDER) {
    return null;
  }
  const validation = validateLexicalTranslation(trimmed);
  if (!validation.accepted) {
    return null;
  }
  return trimmed;
}

export function parseLemmaMeanings(
  frenchComparison: string | null | undefined,
  partOfSpeech: PartOfSpeech,
): { primary: string | null; secondary: string[] } {
  const picked = pickLemmaTranslation(frenchComparison);
  if (!picked) {
    return { primary: null, secondary: [] };
  }

  const meanings = splitLexicalMeanings(picked, partOfSpeech);
  const [primary, ...rest] = meanings;
  return {
    primary: primary ?? null,
    secondary: rest.filter((meaning) => meaning !== primary),
  };
}

export function pickSimpleExplanation(
  canonicalExplanation: string | null | undefined,
  primaryTranslation: string | null,
): string | null {
  if (!isDisplayableUiText(canonicalExplanation)) {
    return null;
  }
  const explanation = canonicalExplanation!.trim();
  if (primaryTranslation && explanation.toLowerCase() === primaryTranslation.toLowerCase()) {
    return null;
  }
  return explanation;
}

export function pickDisplayStress(
  stressMarked: string | null | undefined,
  lemma: string,
): string | null {
  if (!isDisplayableUiText(stressMarked)) {
    return null;
  }
  const marked = stressMarked!.trim();
  if (marked === lemma) {
    return null;
  }
  return marked;
}

export function formatFormMorphLabel(
  form: GraphFormSummary,
  partOfSpeech: PartOfSpeech,
): string | null {
  if (partOfSpeech === "verb") {
    const parts = [
      formatTenseFr(form.tense ?? null),
      formatAspectFr(form.aspect ?? null),
      formatCaseLabelFr(form.case),
    ].filter((value): value is string => Boolean(value));
    return parts.length > 0 ? parts.join(" · ") : null;
  }

  const caseLabel = formatCaseLabelFr(form.case);
  if (caseLabel) {
    return caseLabel;
  }
  return formatTenseFr(form.tense ?? null);
}

export function formatDominantAspectFr(aspect: string | null | undefined): string | null {
  return formatAspectFr(aspect ?? null);
}

export function isDisplayableEnding(ending: string | null | undefined): boolean {
  return isDisplayableMorphologyValue(ending);
}

export type FrequencyVisual = {
  filledStars: number;
  label: string;
};

export function buildFrequencyVisual(
  frequency: WordFrequency | null | undefined,
  frequencyTier: FrequencyTier | null | undefined,
  occurrenceCount: number,
): FrequencyVisual | null {
  if (frequency === "VERY_COMMON") {
    return { filledStars: 5, label: "très fréquent" };
  }
  if (frequency === "COMMON") {
    return { filledStars: 4, label: "fréquent" };
  }
  if (frequency === "UNCOMMON") {
    return { filledStars: 2, label: "peu courant" };
  }
  if (frequency === "RARE") {
    return { filledStars: 1, label: "rare" };
  }

  if (frequencyTier === "TOP_500") {
    return { filledStars: 5, label: "très fréquent" };
  }
  if (frequencyTier === "TOP_1000") {
    return { filledStars: 4, label: "fréquent" };
  }
  if (frequencyTier === "TOP_3000") {
    return { filledStars: 3, label: "courant" };
  }
  if (frequencyTier === "BEYOND_TOP_3000") {
    return { filledStars: 2, label: "rencontré" };
  }

  if (occurrenceCount >= 80) {
    return { filledStars: 4, label: "fréquent" };
  }
  if (occurrenceCount >= 25) {
    return { filledStars: 3, label: "courant" };
  }
  if (occurrenceCount >= 8) {
    return { filledStars: 2, label: "rencontré" };
  }
  if (occurrenceCount >= 2) {
    return { filledStars: 1, label: "peu vu" };
  }

  return null;
}

export function renderFrequencyStars(filledStars: number): string {
  return Array.from({ length: 5 }, (_, index) => (index < filledStars ? "★" : "☆")).join("");
}
