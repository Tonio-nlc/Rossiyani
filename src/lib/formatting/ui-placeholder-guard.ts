/** Internal pipeline / AI strings that must never appear in learner-facing UI. */
const INTERNAL_UI_PLACEHOLDER_PATTERNS: RegExp[] = [
  /\banalyse partielle\b/i,
  /\bchamps minimaux\b/i,
  /\bfallback\b/i,
  /\btodo\b/i,
  /\btraduction mot à mot indisponible\b/i,
  /\btraduction naturelle indisponible\b/i,
  /\banalyse détaillée en attente\b/i,
  /\bordre des mots\s*:\s*analyse en attente\b/i,
  /\busage\s*:\s*analyse en attente\b/i,
  /\bvoir la traduction naturelle\b/i,
  /\benregistr(?:é|ée) en mode dégradé\b/i,
  /\bsegment enregistré sans détail\b/i,
];

const TRANSLATION_ONLY_LINE = /^(?:→|->|Sens\s*:)\s*.+$/i;

export function isInternalUiPlaceholder(text: string | null | undefined): boolean {
  const trimmed = text?.trim();
  if (!trimmed) {
    return true;
  }
  return INTERNAL_UI_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function isTranslationOnlyLine(text: string): boolean {
  return TRANSLATION_ONLY_LINE.test(text.trim());
}

export function isDisplayableUiText(text: string | null | undefined): boolean {
  const trimmed = text?.trim();
  if (!trimmed || trimmed === "—") {
    return false;
  }
  if (/^null$/i.test(trimmed)) {
    return false;
  }
  return !isInternalUiPlaceholder(trimmed);
}

export function isDisplayableMorphologyValue(value: string | null | undefined): boolean {
  return isDisplayableUiText(value);
}
