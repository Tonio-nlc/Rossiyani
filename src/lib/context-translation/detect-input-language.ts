import type { ContextTranslationSourceLanguage } from "./types";

const CYRILLIC = /[\u0400-\u04FF]/;
const FRENCH_MARKERS =
  /\b(je|tu|il|elle|nous|vous|ils|elles|est|sont|être|avoir|pas|très|une|des|le|la|les|on|ce|c'est|qu'|n'|d'|l')\b|[àâçéèêëîïôùûü]/i;
const ENGLISH_MARKERS =
  /\b(the|is|are|was|were|have|has|had|will|would|could|should|we|you|they|I'm|we're|don't|doesn't|n't)\b/i;

export function detectInputLanguage(text: string): ContextTranslationSourceLanguage {
  const trimmed = text.trim();
  if (!trimmed) {
    return "other";
  }

  const cyrillicCount = (trimmed.match(/[\u0400-\u04FF]/g) ?? []).length;
  const latinCount = (trimmed.match(/[A-Za-zÀ-ÿ]/g) ?? []).length;
  const total = cyrillicCount + latinCount;

  if (total > 0 && cyrillicCount / total > 0.4) {
    return "ru";
  }

  if (FRENCH_MARKERS.test(trimmed)) {
    return "fr";
  }

  if (ENGLISH_MARKERS.test(trimmed)) {
    return "en";
  }

  if (CYRILLIC.test(trimmed)) {
    return "ru";
  }

  return "other";
}
