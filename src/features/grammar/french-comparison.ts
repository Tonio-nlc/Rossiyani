import { formatCaseLabelFr } from "./case-styles";
import { extractTranslationFromExplanation } from "@/lib/formatting/extract-translation-from-explanation";

type WordContext = {
  original: string;
  stressMarked: string;
  case: string | null;
  explanation: string;
  partOfSpeech: string;
};

type NeighborWord = {
  original: string;
  partOfSpeech: string;
};

export type FrenchComparison = {
  russianStructure: string;
  frenchStructure: string;
  whyDifferent: string;
};

export const LEXICAL_TRANSLATION_PLACEHOLDER =
  "Voir la traduction naturelle de la phrase.";

/**
 * @deprecated Use extractTranslationFromExplanation from @/lib/formatting/extract-translation-from-explanation
 */
export function extractLexicalTranslationFromExplanation(
  explanation: string,
): string | null {
  return extractTranslationFromExplanation(explanation);
}

/**
 * Builds a concise FR comparison block from existing analysis text.
 */
export function deriveFrenchComparison(
  word: WordContext,
  previousWord?: NeighborWord | null,
): FrenchComparison {
  const russianStructure = buildRussianStructure(word, previousWord);
  const { french, why } = parseExplanation(word.explanation, word.case, previousWord);

  return {
    russianStructure,
    frenchStructure: french,
    whyDifferent: why,
  };
}

function buildRussianStructure(word: WordContext, previous?: NeighborWord | null): string {
  if (previous?.partOfSpeech === "preposition") {
    return `${previous.original} ${word.original}`;
  }
  return word.stressMarked || word.original;
}

function parseExplanation(
  explanation: string,
  grammaticalCase: string | null,
  previous?: NeighborWord | null,
): { french: string; why: string } {
  const lines = explanation
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const extracted = extractLexicalTranslationFromExplanation(explanation);
  let french = extracted ?? "";

  if (!french) {
    french = LEXICAL_TRANSLATION_PLACEHOLDER;
  }

  const caseFr = formatCaseLabelFr(grammaticalCase);
  const prep = previous?.partOfSpeech === "preposition" ? previous.original : null;

  let why = lines[0] ?? explanation;
  if (why.length > 220) {
    why = `${why.slice(0, 217)}…`;
  }

  if (prep && caseFr) {
    why = `Le russe utilise ${prep} + ${caseFr} sur le nom. Le français utilise une préposition sans marquer le cas sur le nom. ${why}`;
  } else if (caseFr) {
    why = `Forme au ${caseFr}. ${why}`;
  }

  return { french, why };
}
