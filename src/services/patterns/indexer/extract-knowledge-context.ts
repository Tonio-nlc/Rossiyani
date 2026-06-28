import { normalizeCaseKey } from "@/lib/grammar/normalize-case-key";
import type { SentenceAnalysisOutput } from "@/services/ai/schemas";
import type { PatternIndexerKnowledgeContext } from "@/types/pattern-instances";

const TRANSFER_VERB_LEMMAS = new Set([
  "дать",
  "сказать",
  "звонить",
  "писать",
  "показать",
  "отправить",
  "передать",
  "рассказать",
  "пожелать",
]);

const SUBJECT_PRONOUNS = new Set([
  "я",
  "ты",
  "он",
  "она",
  "оно",
  "мы",
  "вы",
  "они",
]);

/**
 * Derives knowledge concept keys from an existing sentence analysis.
 * Reuses morphological and syntactic fields — no AI recomputation.
 */
export function extractConceptKeysFromAnalysis(analysis: SentenceAnalysisOutput): string[] {
  const keys = new Set<string>();

  for (const word of analysis.words) {
    const caseKey = normalizeCaseKey(word.case);
    if (caseKey) {
      keys.add(`${caseKey}_case`);
      if (caseKey === "genitive") {
        keys.add("genitive_case");
      }
      if (caseKey === "dative") {
        keys.add("dative_case");
      }
      if (caseKey === "accusative") {
        keys.add("accusative_case");
      }
    }

    const aspect = word.aspect?.toLowerCase();
    if (aspect === "perfective" || aspect === "perfectif") {
      keys.add("perfective_aspect");
    }
    if (aspect === "imperfective" || aspect === "imperfait") {
      keys.add("imperfective_aspect");
    }

    if (word.partOfSpeech === "noun" || word.partOfSpeech === "adjective") {
      keys.add("declension_nouns");
    }
  }

  const lowerOriginals = analysis.words.map((word) => word.original.toLowerCase());
  if (lowerOriginals.includes("у")) {
    keys.add("u_genitive_possession");
    keys.add("existence_construction");
  }

  if (lowerOriginals.includes("есть") || lowerOriginals.includes("нет")) {
    keys.add("existence_construction");
  }

  const hasSubjectPronoun = analysis.words.some(
    (word) =>
      word.partOfSpeech === "pronoun" && SUBJECT_PRONOUNS.has(word.lemma.toLowerCase()),
  );
  const hasFiniteVerb = analysis.words.some(
    (word) => word.partOfSpeech === "verb" && (word.tense || word.original !== word.lemma),
  );
  if (hasFiniteVerb && !hasSubjectPronoun) {
    keys.add("pro_drop");
    keys.add("subject_ellipsis");
  }

  const hasTransferVerb = analysis.words.some((word) =>
    TRANSFER_VERB_LEMMAS.has(word.lemma.toLowerCase()),
  );
  const hasDative = analysis.words.some((word) => normalizeCaseKey(word.case) === "dative");
  if (hasTransferVerb && hasDative) {
    keys.add("indirect_object");
  }

  return [...keys];
}

export function mergeKnowledgeContext(
  analysis: SentenceAnalysisOutput,
  partial?: Partial<PatternIndexerKnowledgeContext>,
): PatternIndexerKnowledgeContext {
  const derivedKeys = extractConceptKeysFromAnalysis(analysis);
  const conceptKeys = new Set([...derivedKeys, ...(partial?.conceptKeys ?? [])]);

  return {
    conceptKeys: [...conceptKeys],
    occurrenceIdsByPosition: partial?.occurrenceIdsByPosition ?? {},
    phraseOccurrenceIds: partial?.phraseOccurrenceIds ?? [],
  };
}

export function findOccurrenceIdForSpan(
  context: PatternIndexerKnowledgeContext,
  span: { startPosition: number; endPosition: number },
): string | null {
  const positionMatch = context.occurrenceIdsByPosition[span.startPosition];
  if (positionMatch) {
    return positionMatch;
  }

  for (const phrase of context.phraseOccurrenceIds) {
    if (phrase.startPosition === span.startPosition && phrase.endPosition === span.endPosition) {
      return phrase.id;
    }
  }

  return null;
}
