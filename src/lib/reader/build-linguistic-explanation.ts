import { POS_LABELS_FR } from "@/features/grammar";
import { formatCaseLabelFr } from "@/features/grammar";
import { isDisplayableUiText } from "@/lib/formatting/ui-placeholder-guard";
import {
  formatAspectFr,
  formatGenderFr,
  formatNumberFr,
} from "@/lib/formatting/word-morphology-display";
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
  const pos = POS_LABELS_FR[occurrence.partOfSpeech] ?? occurrence.partOfSpeech;
  const gender = formatGenderFr(occurrence.gender);
  const number = formatNumberFr(occurrence.number);
  const grammaticalCase = formatCaseLabelFr(occurrence.case);
  const aspect = formatAspectFr(occurrence.aspect);

  if (occurrence.partOfSpeech === "adjective" && gender && number) {
    const casePart = grammaticalCase ? ` au ${grammaticalCase.toLowerCase()}` : "";
    return `C'est la forme ${gender.toLowerCase()} ${number.toLowerCase()}${casePart}.`;
  }

  if (occurrence.partOfSpeech === "noun" && gender && number) {
    const casePart = grammaticalCase ? ` au ${grammaticalCase.toLowerCase()}` : "";
    return `C'est la forme ${gender.toLowerCase()} ${number.toLowerCase()}${casePart}.`;
  }

  if (occurrence.partOfSpeech === "verb" && aspect) {
    return `C'est la forme ${aspect.toLowerCase()} du verbe.`;
  }

  if (grammaticalCase && pos) {
    return `Ce ${pos.toLowerCase()} apparaît ici au cas ${grammaticalCase.toLowerCase()}.`;
  }

  if (pos) {
    return `C'est une forme du ${pos.toLowerCase()} « ${occurrence.lemma} ».`;
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
    !paragraphs.some((line) => line.includes("s'accorde avec"))
  ) {
    paragraphs.push(`Cet adjectif s'accorde avec ${options.agreementTarget}.`);
  }

  const tier = options?.frequencyTier?.toLowerCase();
  if (
    (tier === "core" || tier === "high" || occurrence.frequency === "common") &&
    !paragraphs.some((line) => line.includes("courant"))
  ) {
    paragraphs.push("Mot fréquent dans le russe quotidien.");
  }

  return paragraphs.slice(0, 3);
}
