import { LEXICAL_TRANSLATION_PLACEHOLDER } from "@/features/grammar/french-comparison";
import { estimateWordTranslation } from "@/lib/formatting/estimate-word-translation";
import { clampToSentences } from "@/lib/formatting/clamp-text";
import {
  LEXICAL_TRANSLATION_EMPTY,
  validateLexicalTranslation,
} from "@/lib/formatting/lexical-validation";
import { splitLexicalMeanings } from "@/lib/formatting/lexical-meanings";
import {
  isDisplayableUiText,
  isInternalUiPlaceholder,
  isTranslationOnlyLine,
} from "@/lib/formatting/ui-placeholder-guard";
import {
  collectExplanationCandidates,
  lemmaKeysMatch,
  validateExplanationCandidate,
  type ExplanationSource,
  WORD_EXPLANATION_EMPTY,
} from "@/lib/formatting/word-explanation-guard";
import type { PartOfSpeech } from "@/types/domain";
import type { WordDetailGraph } from "@/types/word-detail-graph";

export type WordTranslationSource =
  | "word"
  | "KnowledgeForm"
  | "KnowledgeLemma"
  | "dictionary"
  | "none";

export type WordSemanticMorphology = {
  stem: string;
  ending: string;
  case: string | null;
  gender: string | null;
  number: string | null;
  tense: string | null;
  aspect: string | null;
};

export type WordSemanticData = {
  translation: string;
  primaryMeanings: string[];
  extraMeanings: string[];
  explanation: string;
  lemma: string;
  partOfSpeech: PartOfSpeech;
  morphology: WordSemanticMorphology;
  stress: string;
  confidence: number;
  translationSource: WordTranslationSource;
  explanationSource: ExplanationSource | null;
  estimated: boolean;
  posEmoji: string | null;
};

const POS_EMOJI: Partial<Record<PartOfSpeech, string>> = {
  noun: "🌳",
  adjective: "❄",
  verb: "▶",
};

const CONFIDENCE_BY_SOURCE: Record<Exclude<WordTranslationSource, "none">, number> = {
  word: 0.95,
  KnowledgeForm: 0.92,
  KnowledgeLemma: 0.9,
  dictionary: 0.55,
};

function pickLexicalTranslation(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed || trimmed === LEXICAL_TRANSLATION_PLACEHOLDER) {
      continue;
    }
    const validation = validateLexicalTranslation(trimmed);
    if (validation.accepted) {
      return trimmed;
    }
  }
  return null;
}

/** Word.translationCanonical — persisted AI gloss for this occurrence. */
function translationFromWord(detail: WordDetailGraph): string | null {
  return pickLexicalTranslation(detail.occurrence.translationCanonical ?? null);
}

/**
 * KnowledgeForm.translation — explicit lexical field only.
 * KnowledgeForm has no translation column today; reserved for future schema.
 */
function translationFromKnowledgeForm(): string | null {
  return null;
}

/** KnowledgeLemma.translation — frenchComparison on a lemma bound to the occurrence. */
function translationFromKnowledgeLemma(detail: WordDetailGraph): string | null {
  const { lemma } = detail.occurrence;

  if (detail.domain.lemma && lemmaKeysMatch(lemma, detail.domain.lemma.lemma)) {
    const hit = pickLexicalTranslation(detail.domain.lemma.frenchComparison);
    if (hit) {
      return hit;
    }
  }

  if (detail.lemmaKnowledge && lemmaKeysMatch(lemma, detail.lemmaKnowledge.lemma)) {
    return pickLexicalTranslation(detail.lemmaKnowledge.frenchComparison);
  }

  return null;
}

function resolveTranslation(detail: WordDetailGraph): {
  translation: string;
  source: WordTranslationSource;
  estimated: boolean;
  confidence: number;
} {
  const steps: Array<{
    candidate: string | null;
    source: Exclude<WordTranslationSource, "none">;
    estimated: boolean;
  }> = [
    { candidate: translationFromWord(detail), source: "word", estimated: false },
    { candidate: translationFromKnowledgeForm(), source: "KnowledgeForm", estimated: false },
    { candidate: translationFromKnowledgeLemma(detail), source: "KnowledgeLemma", estimated: false },
    { candidate: estimateWordTranslation(detail), source: "dictionary", estimated: true },
  ];

  for (const step of steps) {
    if (step.candidate) {
      return {
        translation: step.candidate,
        source: step.source,
        estimated: step.estimated,
        confidence: CONFIDENCE_BY_SOURCE[step.source],
      };
    }
  }

  return {
    translation: LEXICAL_TRANSLATION_EMPTY,
    source: "none",
    estimated: false,
    confidence: 0,
  };
}

function isPedagogicalExplanation(text: string): boolean {
  const trimmed = text.trim();
  if (!isDisplayableUiText(trimmed)) {
    return false;
  }
  if (isTranslationOnlyLine(trimmed)) {
    return false;
  }
  if (isInternalUiPlaceholder(trimmed)) {
    return false;
  }
  return true;
}

function resolveExplanation(detail: WordDetailGraph): {
  text: string;
  source: ExplanationSource | null;
} {
  for (const candidate of collectExplanationCandidates(detail)) {
    const validation = validateExplanationCandidate(candidate, detail);
    if (!validation.accepted || !isPedagogicalExplanation(candidate.text)) {
      continue;
    }

    const { text } = clampToSentences(candidate.text.trim(), 2);
    const trimmed = text.trim();
    if (isDisplayableUiText(trimmed)) {
      return { text: trimmed, source: candidate.source };
    }
  }

  return { text: WORD_EXPLANATION_EMPTY, source: null };
}

function logWordSemantics(input: {
  word: string;
  translation: string;
  translationSource: WordTranslationSource;
  explanationSource: ExplanationSource | null;
  confidence: number;
}): void {
  console.log(
    `[WORD_SEMANTICS] word=${input.word} translation=${input.translation} translationSource=${input.translationSource} explanationSource=${input.explanationSource ?? "none"} confidence=${input.confidence.toFixed(2)}`,
  );
}

/**
 * Single source of truth for word-level translation and explanation.
 * Translation: Word | KnowledgeForm | KnowledgeLemma | dictionary | —
 * Explanation: pedagogical sources only | —
 * No inference from explanation, sentence, or canonicalExplanation.
 */
export function resolveWordSemanticData(detail: WordDetailGraph): WordSemanticData {
  const { occurrence } = detail;
  const { translation, source, estimated, confidence } = resolveTranslation(detail);
  const allMeanings = splitLexicalMeanings(translation, occurrence.partOfSpeech);
  const primaryMeanings =
    allMeanings.length <= 2 ? allMeanings : allMeanings.slice(0, 2);
  const extraMeanings = allMeanings.length <= 2 ? [] : allMeanings.slice(2);

  const { text: explanation, source: explanationSource } = resolveExplanation(detail);

  logWordSemantics({
    word: occurrence.original,
    translation,
    translationSource: source,
    explanationSource,
    confidence,
  });

  return {
    translation,
    primaryMeanings,
    extraMeanings,
    explanation,
    lemma: occurrence.lemma,
    partOfSpeech: occurrence.partOfSpeech,
    morphology: {
      stem: occurrence.stem,
      ending: occurrence.ending,
      case: occurrence.case,
      gender: occurrence.gender,
      number: occurrence.number,
      tense: occurrence.tense,
      aspect: occurrence.aspect,
    },
    stress: occurrence.stressMarked,
    confidence,
    translationSource: source,
    explanationSource,
    estimated,
    posEmoji: POS_EMOJI[occurrence.partOfSpeech] ?? null,
  };
}
