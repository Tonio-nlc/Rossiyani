import { POS_LABELS_FR } from "@/features/grammar";
import type { PartOfSpeech } from "@/types/domain";

export const LEXICAL_TRANSLATION_EMPTY = "—";
export const MAX_LEXICAL_TRANSLATION_LENGTH = 50;

export type ValidationResult =
  | { accepted: true; reason: "ok" }
  | { accepted: false; reason: string };

const GRAMMAR_LABELS = new Set<string>([
  ...Object.values(POS_LABELS_FR),
  "nom",
  "verbe",
  "adjectif",
  "adverbe",
  "préposition",
  "preposition",
  "conjonction",
  "particule",
  "pronom",
  "interjection",
  "numéral",
  "numeral",
  "préposition (sens contextuel)",
  "conjonction",
  "particule",
  "pronom",
  "adverbe",
  "verbe",
  "nom",
  "adjectif",
]);

const GRAMMAR_LABEL_PATTERN =
  /^(nom|verbe|adjectif|adverbe|préposition|preposition|conjonction|particule|pronom|interjection|numéral|numeral)$/i;

const INVALID_TRANSLATION_PREFIXES = [
  /^le russe\b/i,
  /^utilisé\b/i,
  /^utilise\b/i,
  /^dans cette phrase\b/i,
  /^construction\b/i,
  /^forme\b/i,
  /^nom\s+(masculin|féminin|neutre|commun)/i,
  /^verbe\s+(intransitif|transitif|de|à)/i,
  /^adjectif\s+(qualificatif|possessif)/i,
  /^adverbe\s+de\b/i,
  /^voir la traduction naturelle\b/i,
];

const SENTENCE_TRANSLATION_MARKERS = [
  /\bdans (cette |la )?phrase\b/i,
  /\btraduction (naturelle|de la phrase)\b/i,
  /\bl['']ensemble (de la |du )?(phrase|texte)\b/i,
];

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase();
}

export function validateLexicalTranslation(candidate: string): ValidationResult {
  const trimmed = candidate.trim();
  if (!trimmed) {
    return { accepted: false, reason: "empty" };
  }
  if (trimmed === LEXICAL_TRANSLATION_EMPTY) {
    return { accepted: false, reason: "empty_marker" };
  }
  if (trimmed.length > MAX_LEXICAL_TRANSLATION_LENGTH) {
    return { accepted: false, reason: "too_long" };
  }
  if (/[\p{Script=Cyrillic}]/u.test(trimmed)) {
    return { accepted: false, reason: "cyrillic" };
  }

  const lower = normalizeLabel(trimmed);
  if (GRAMMAR_LABELS.has(lower)) {
    return { accepted: false, reason: "grammar_label" };
  }
  if (GRAMMAR_LABEL_PATTERN.test(trimmed)) {
    return { accepted: false, reason: "grammar_label" };
  }

  for (const pattern of INVALID_TRANSLATION_PREFIXES) {
    if (pattern.test(trimmed)) {
      return { accepted: false, reason: "invalid_prefix" };
    }
  }

  for (const pattern of SENTENCE_TRANSLATION_MARKERS) {
    if (pattern.test(trimmed)) {
      return { accepted: false, reason: "sentence_level" };
    }
  }

  if (!/[a-zàâäéèêëïîôùûüç-]/i.test(trimmed)) {
    return { accepted: false, reason: "not_french" };
  }

  return { accepted: true, reason: "ok" };
}

export function validateMorphology(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { accepted: false, reason: "empty" };
  }
  if (trimmed.length > 80) {
    return { accepted: false, reason: "too_long" };
  }

  const grammarCheck = validateLexicalTranslation(trimmed);
  if (!grammarCheck.accepted && grammarCheck.reason === "grammar_label") {
    return { accepted: false, reason: "grammar_label" };
  }

  if (/^le russe\b/i.test(trimmed)) {
    return { accepted: false, reason: "sentence_fragment" };
  }

  for (const pattern of SENTENCE_TRANSLATION_MARKERS) {
    if (pattern.test(trimmed)) {
      return { accepted: false, reason: "sentence_level" };
    }
  }

  return { accepted: true, reason: "ok" };
}

export function isPosFallbackLabel(value: string, partOfSpeech?: PartOfSpeech): boolean {
  const lower = normalizeLabel(value);
  if (GRAMMAR_LABELS.has(lower)) {
    return true;
  }
  if (partOfSpeech && lower === POS_LABELS_FR[partOfSpeech]?.toLowerCase()) {
    return true;
  }
  return false;
}
