const COMBINING_MARKS = /[\u0300-\u036f\u0483-\u0489]/g;

/**
 * Normalizes Russian text for LinguisticLibrary lookup keys.
 * Case-insensitive; NFC; strips stress diacritics.
 */
export function toRussianLookupKey(text: string): string {
  return text
    .normalize("NFC")
    .replace(COMBINING_MARKS, "")
    .trim()
    .toLocaleLowerCase("ru-RU");
}

/** Stable key for a full sentence cache entry. */
export function sentenceLookupKey(russianText: string): string {
  return toRussianLookupKey(russianText);
}

/** Stable key for a surface word form. */
export function formLookupKey(original: string): string {
  return toRussianLookupKey(original);
}

/** Stable key for a multi-word phrase label. */
export function phraseLookupKey(label: string): string {
  return toRussianLookupKey(label.replace(/\s+/g, " ").trim());
}

/** Key for ending + case pedagogical entries. */
export function endingLookupKey(ending: string, grammaticalCase?: string | null): string {
  const casePart = grammaticalCase
    ? toRussianLookupKey(grammaticalCase)
    : "_";
  return `${ending}|${casePart}`;
}

/** Stable key for a canonical pedagogical concept. */
export function conceptLookupKey(raw: string): string {
  return toRussianLookupKey(raw.replace(/\s+/g, " ").trim()).replace(/\s/g, "_");
}

/** Stable key for a grammatical case node. */
export function caseLookupKey(caseKey: string): string {
  return toRussianLookupKey(caseKey);
}

/** Key for preposition + case patterns (e.g. в + prepositional). */
export function prepositionPatternKey(preposition: string, caseKey: string): string {
  return `${toRussianLookupKey(preposition)}_${caseLookupKey(caseKey)}`;
}
