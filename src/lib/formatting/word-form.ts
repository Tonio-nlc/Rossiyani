/** Combining stress marks and similar diacritics — ignored when comparing word forms. */
const COMBINING_MARKS = /[\u0300-\u036f\u0483-\u0489]/g;

/**
 * Normalizes text for stem+ending vs original comparison.
 * Case-insensitive (Russian locale); NFC; strips stress diacritics.
 */
export function normalizeForWordFormCompare(text: string): string {
  return text
    .normalize("NFC")
    .replace(COMBINING_MARKS, "")
    .toLocaleLowerCase("ru-RU");
}

/**
 * Stem inferred from surface form by removing the ending suffix.
 */
export function deriveStemFromSurface(original: string, ending: string): string {
  if (!ending) {
    return original;
  }
  return original.slice(0, original.length - ending.length);
}

/**
 * Returns true when original matches stem + ending.
 * Accepts case differences (Таяла = таял + а) and morphological stems
 * (городке = городк + е), not only literal concatenation (городок + е fails).
 */
export function wordFormMatchesOriginal(
  original: string,
  stem: string,
  ending: string,
): boolean {
  const normOriginal = normalizeForWordFormCompare(original);
  const normStem = normalizeForWordFormCompare(stem);
  const normEnding = normalizeForWordFormCompare(ending);
  const normCombined = normalizeForWordFormCompare(stem + ending);

  if (normOriginal === normCombined) {
    return true;
  }

  if (!ending) {
    return normOriginal === normStem;
  }

  if (!normOriginal.endsWith(normEnding)) {
    return false;
  }

  const stemFromSurface = deriveStemFromSurface(original, ending);
  return normalizeForWordFormCompare(stemFromSurface) === normStem;
}

/**
 * Reconciles stem when the model used a lemma instead of the surface stem.
 * Example: original городке, ending е, stem городок → stem городк
 */
export function reconcileWordStem(
  original: string,
  stem: string,
  ending: string,
): string {
  if (wordFormMatchesOriginal(original, stem, ending)) {
    return stem;
  }

  const derived = deriveStemFromSurface(original, ending);
  if (wordFormMatchesOriginal(original, derived, ending)) {
    return derived;
  }

  return stem;
}
