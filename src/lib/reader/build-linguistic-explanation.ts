import { isDisplayableUiText } from "@/lib/formatting/ui-placeholder-guard";
import {
  isSentenceLevelExplanation,
  WORD_EXPLANATION_EMPTY,
} from "@/lib/formatting/word-explanation-guard";
import type { PartOfSpeech } from "@/types/domain";
import type { WordOccurrenceContext } from "@/types/knowledge-workspace";

const GENERIC_FILLER_PATTERNS = [
  /^adjectif d[eé]crivant/i,
  /^nom d[eé]signant/i,
  /^verbe exprimant/i,
  /attribut li[eé]/i,
  /d[eé]crivant un attribut/i,
  /^mot (?:russe )?(?:qui |de )/i,
  /^forme (?:du |de )?(?:mot|lemme)/i,
];

const POS_LABEL: Record<PartOfSpeech, string> = {
  noun: "noun",
  verb: "verb",
  adjective: "adjective",
  pronoun: "pronoun",
  adverb: "adverb",
  numeral: "numeral",
  preposition: "preposition",
  conjunction: "conjunction",
  particle: "particle",
  interjection: "interjection",
};

function formatGender(value: string | null): string | null {
  if (!value?.trim()) {
    return null;
  }
  const v = value.toLowerCase();
  if (v.includes("masc") || v === "m") {
    return "masculine";
  }
  if (v.includes("fem") || v === "f") {
    return "feminine";
  }
  if (v.includes("neut")) {
    return "neuter";
  }
  return value.trim().toLowerCase();
}

function formatNumber(value: string | null): string | null {
  if (!value?.trim()) {
    return null;
  }
  const v = value.toLowerCase();
  if (v.includes("plur") || v === "pl") {
    return "plural";
  }
  if (v.includes("sing") || v === "sg") {
    return "singular";
  }
  return value.trim().toLowerCase();
}

function formatCase(value: string | null): string | null {
  if (!value?.trim()) {
    return null;
  }
  return value.trim().toLowerCase();
}

function formatAspect(value: string | null): string | null {
  if (!value?.trim()) {
    return null;
  }
  const v = value.toLowerCase();
  if (v.includes("imperf")) {
    return "imperfective";
  }
  if (v.includes("perf")) {
    return "perfective";
  }
  return value.trim().toLowerCase();
}

function isGenericFiller(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed === WORD_EXPLANATION_EMPTY) {
    return true;
  }
  return GENERIC_FILLER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function isUsefulStoredExplanation(
  text: string,
  partOfSpeech: PartOfSpeech,
): boolean {
  if (!isDisplayableUiText(text) || isGenericFiller(text)) {
    return false;
  }
  if (isSentenceLevelExplanation(text, partOfSpeech)) {
    return false;
  }
  return true;
}

function describeForm(occurrence: WordOccurrenceContext): string | null {
  const pos = POS_LABEL[occurrence.partOfSpeech];
  const gender = formatGender(occurrence.gender);
  const number = formatNumber(occurrence.number);
  const grammaticalCase = formatCase(occurrence.case);
  const aspect = formatAspect(occurrence.aspect);

  if (occurrence.partOfSpeech === "adjective" && gender && number) {
    const casePart = grammaticalCase ? `${grammaticalCase} ` : "";
    return `This is the ${gender} ${number} ${casePart}form.`.replace(/\s+/g, " ");
  }

  if (occurrence.partOfSpeech === "noun" && gender && number) {
    const casePart = grammaticalCase ? `${grammaticalCase} ` : "";
    return `This is the ${gender} ${number} ${casePart}form.`.replace(/\s+/g, " ");
  }

  if (occurrence.partOfSpeech === "verb" && aspect) {
    return `This is the ${aspect} ${pos} form.`;
  }

  if (grammaticalCase && pos) {
    return `This ${pos} appears in the ${grammaticalCase} case here.`;
  }

  if (pos) {
    return `This is a ${pos} form of ${occurrence.lemma}.`;
  }

  return null;
}

export function buildLinguisticExplanation(
  occurrence: WordOccurrenceContext,
  options?: {
    agreementTarget?: string | null;
    frequencyTier?: string | null;
  },
): string[] {
  const paragraphs: string[] = [];

  if (isUsefulStoredExplanation(occurrence.explanation, occurrence.partOfSpeech)) {
    paragraphs.push(occurrence.explanation.trim());
  } else {
    const formDescription = describeForm(occurrence);
    if (formDescription) {
      paragraphs.push(formDescription);
    }
  }

  if (
    options?.agreementTarget &&
    occurrence.partOfSpeech === "adjective" &&
    !paragraphs.some((line) => line.includes("agrees with"))
  ) {
    paragraphs.push(`This adjective agrees with ${options.agreementTarget}.`);
  }

  const tier = options?.frequencyTier?.toLowerCase();
  if (
    (tier === "core" || tier === "high" || occurrence.frequency === "common") &&
    !paragraphs.some((line) => line.includes("everyday"))
  ) {
    paragraphs.push("Frequently used in everyday Russian.");
  }

  return paragraphs.slice(0, 3);
}
