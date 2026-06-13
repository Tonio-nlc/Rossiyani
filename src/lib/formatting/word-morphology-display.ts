import { formatCaseLabelFr } from "@/features/grammar";
import { validateMorphology } from "@/lib/formatting/lexical-validation";
import { isDisplayableMorphologyValue } from "@/lib/formatting/ui-placeholder-guard";
import { normalizeForWordFormCompare } from "@/lib/formatting/word-form";
import type { PartOfSpeech } from "@/types/domain";
import type { WordOccurrenceContext } from "@/types/knowledge-workspace";

export type MorphologyDisplayOptions = {
  gender?: string | null;
};

export type MorphologyDisplayField = {
  label: string;
  value: string;
};

function hasText(value: string | null | undefined): value is string {
  return Boolean(value?.trim());
}

export function formatGenderFr(value: string | null): string | null {
  if (!hasText(value)) {
    return null;
  }
  const v = value.toLowerCase();
  if (v.includes("masc") || v === "m" || v === "masculin") {
    return "Masculin";
  }
  if (v.includes("fem") || v === "f" || v === "féminin") {
    return "Féminin";
  }
  if (v.includes("neut")) {
    return "Neutre";
  }
  const trimmed = value.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function formatNumberFr(value: string | null): string | null {
  if (!hasText(value)) {
    return null;
  }
  const v = value.toLowerCase();
  if (v.includes("plur") || v === "pl" || v === "pluriel") {
    return "Pluriel";
  }
  if (v.includes("sing") || v === "sg" || v === "singulier") {
    return "Singulier";
  }
  const trimmed = value.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function formatTenseFr(value: string | null): string | null {
  if (!hasText(value)) {
    return null;
  }
  const v = value.toLowerCase();
  const map: Record<string, string> = {
    present: "Présent",
    past: "Passé",
    future: "Futur",
    imperative: "Impératif",
    infinitive: "Infinitif",
    participle: "Participe",
  };
  return map[v] ?? (value.trim().charAt(0).toUpperCase() + value.trim().slice(1));
}

export function formatAspectFr(value: string | null): string | null {
  if (!hasText(value)) {
    return null;
  }
  const v = value.toLowerCase();
  if (v.includes("imperf")) {
    return "Imperfectif";
  }
  if (v.includes("perf")) {
    return "Perfectif";
  }
  const trimmed = value.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function formatPersonFr(value: string | null): string | null {
  if (!hasText(value)) {
    return null;
  }
  const v = value.toLowerCase();
  if (/^1|first|1st|prem/.test(v)) {
    return "1re personne";
  }
  if (/^2|second|2nd|deux/.test(v)) {
    return "2e personne";
  }
  if (/^3|third|3rd|trois/.test(v)) {
    return "3e personne";
  }
  if (v.includes("person")) {
    return value.trim();
  }
  return null;
}

export function formatMoodFr(value: string | null): string | null {
  if (!hasText(value)) {
    return null;
  }
  const v = value.toLowerCase();
  const map: Record<string, string> = {
    indicative: "indicatif",
    indicatif: "indicatif",
    subjunctive: "subjonctif",
    subjonctif: "subjonctif",
    conditional: "conditionnel",
    conditionnel: "conditionnel",
    imperative: "impératif",
    impératif: "impératif",
    infinitive: "infinitif",
    infinitif: "infinitif",
    participle: "participe",
    participe: "participe",
  };
  for (const [key, label] of Object.entries(map)) {
    if (v.includes(key)) {
      return label;
    }
  }
  return value.trim();
}

function addField(
  fields: MorphologyDisplayField[],
  label: string,
  value: string | null,
): void {
  if (!isDisplayableMorphologyValue(value)) {
    return;
  }
  const validation = validateMorphology(value!);
  if (!validation.accepted) {
    return;
  }
  fields.push({ label, value: value!.trim() });
}

export function hasStressMark(text: string): boolean {
  const normalized = text.normalize("NFC");
  return /[\u0300-\u036f\u0483-\u0489]/.test(normalized) || normalized.includes("́");
}

export function shouldShowStress(occurrence: WordOccurrenceContext): boolean {
  if (!hasText(occurrence.stressMarked)) {
    return false;
  }
  return hasStressMark(occurrence.stressMarked);
}

export function shouldShowLemma(
  occurrence: WordOccurrenceContext,
  options?: { forceWhenIncomplete?: boolean },
): boolean {
  if (!hasText(occurrence.lemma)) {
    return false;
  }
  if (options?.forceWhenIncomplete) {
    return true;
  }
  return (
    normalizeForWordFormCompare(occurrence.lemma) !==
    normalizeForWordFormCompare(occurrence.original)
  );
}

export function buildStemEndingDisplay(occurrence: WordOccurrenceContext): string | null {
  if (!occurrence.ending?.trim()) {
    return null;
  }
  const stemInWord = occurrence.stressMarked.slice(
    0,
    occurrence.stressMarked.length - occurrence.ending.length,
  );
  const endingInWord = occurrence.stressMarked.slice(-occurrence.ending.length);
  if (!stemInWord.trim() || !endingInWord.trim()) {
    return null;
  }
  return `${stemInWord} + ${endingInWord}`;
}

function supportsStemEnding(pos: PartOfSpeech): boolean {
  return pos === "noun" || pos === "adjective" || pos === "verb";
}

function supportsCase(pos: PartOfSpeech): boolean {
  return pos === "noun" || pos === "adjective" || pos === "pronoun" || pos === "numeral";
}

/** Person / mood may be encoded in `case` for legacy verb analyses. */
function verbPersonFromCase(caseValue: string | null): string | null {
  return formatPersonFr(caseValue);
}

function verbMoodFromCase(caseValue: string | null): string | null {
  if (!hasText(caseValue)) {
    return null;
  }
  const mood = formatMoodFr(caseValue);
  if (!mood) {
    return null;
  }
  if (formatCaseLabelFr(caseValue)) {
    return null;
  }
  return mood;
}

export function buildMorphologyDisplayFields(
  occurrence: WordOccurrenceContext,
  options?: MorphologyDisplayOptions,
): MorphologyDisplayField[] {
  const fields: MorphologyDisplayField[] = [];
  const pos = occurrence.partOfSpeech;
  const gender = options?.gender ?? occurrence.gender;

  if (shouldShowLemma(occurrence)) {
    addField(fields, "Lemme", occurrence.lemma.trim());
  }

  if (pos === "verb") {
    addField(fields, "Personne", verbPersonFromCase(occurrence.case));
    addField(fields, "Temps", formatTenseFr(occurrence.tense));
    addField(fields, "Aspect", formatAspectFr(occurrence.aspect));
    addField(fields, "Mode", verbMoodFromCase(occurrence.case));
    addField(fields, "Nombre", formatNumberFr(occurrence.number));
  } else if (pos === "noun" || pos === "adjective") {
    addField(fields, "Genre", formatGenderFr(gender));
    addField(fields, "Nombre", formatNumberFr(occurrence.number));
    addField(fields, "Cas", formatCaseLabelFr(occurrence.case));
  } else if (supportsCase(pos)) {
    addField(fields, "Genre", formatGenderFr(gender));
    addField(fields, "Nombre", formatNumberFr(occurrence.number));
    addField(fields, "Cas", formatCaseLabelFr(occurrence.case));
  } else {
    addField(fields, "Genre", formatGenderFr(gender));
    addField(fields, "Nombre", formatNumberFr(occurrence.number));
    addField(fields, "Temps", formatTenseFr(occurrence.tense));
    addField(fields, "Aspect", formatAspectFr(occurrence.aspect));
  }

  return fields;
}

export function shouldShowStemEnding(occurrence: WordOccurrenceContext): boolean {
  return supportsStemEnding(occurrence.partOfSpeech) && Boolean(buildStemEndingDisplay(occurrence));
}
