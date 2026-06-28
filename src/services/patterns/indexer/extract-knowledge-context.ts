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

const DATIVE_EXPERIENCER_FORMS = new Set([
  "мне",
  "тебе",
  "ему",
  "ей",
  "нам",
  "вам",
  "им",
]);

const IMPERSONAL_PREDICATES = new Set([
  "холодно",
  "жарко",
  "скучно",
  "весело",
  "грустно",
  "интересно",
  "трудно",
  "легко",
  "теплее",
  "уютнее",
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
      if (caseKey === "nominative") {
        keys.add("nominative_case");
      }
      if (caseKey === "prepositional") {
        keys.add("prepositional_case");
        keys.add("locative_case");
      }
    }

    if (word.partOfSpeech === "noun" && word.number === "plural") {
      keys.add("plural_nouns");
    }

    if (word.gender) {
      keys.add("grammatical_gender");
    }

    if (word.partOfSpeech === "verb") {
      const tense = word.tense?.toLowerCase();
      if (tense === "present" || tense === "présent" || tense === "pres") {
        keys.add("present_tense");
        keys.add("verb_conjugation");
      }
      const lemma = word.lemma.toLowerCase();
      if (lemma === "давать" || word.original.toLowerCase().startsWith("давай")) {
        keys.add("imperative");
      }
    }

    if (word.stressMarked && word.stressMarked !== word.original) {
      keys.add("lexical_stress");
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

  const neIndex = lowerOriginals.indexOf("не");
  const hasNegatedVerb =
    neIndex >= 0 &&
    analysis.words.some(
      (word) =>
        word.partOfSpeech === "verb" &&
        word.position > neIndex &&
        word.position <= neIndex + 2,
    );
  if (hasNegatedVerb) {
    keys.add("verbal_negation");
  }

  if (analysis.russianText.includes("?")) {
    keys.add("questions");
  }
  if (
    analysis.words.some((word) =>
      ["что", "где", "когда", "как", "почему", "кто", "сколько"].includes(
        word.lemma.toLowerCase(),
      ),
    )
  ) {
    keys.add("interrogative_words");
  }

  if (lowerOriginals.includes("в")) {
    keys.add("preposition_v");
  }
  if (lowerOriginals.includes("на")) {
    keys.add("preposition_na");
  }

  const hasDativeExperiencerForm = analysis.words.some((word) =>
    DATIVE_EXPERIENCER_FORMS.has(word.original.toLowerCase()),
  );
  const hasImpersonalPredicate = analysis.words.some((word) =>
    IMPERSONAL_PREDICATES.has(word.lemma.toLowerCase()),
  );
  const dativeExperiencer =
    hasDativeExperiencerForm &&
    (hasImpersonalPredicate ||
      analysis.words.some(
        (word) =>
          (word.partOfSpeech === "pronoun" || word.partOfSpeech === "noun") &&
          (normalizeCaseKey(word.case) === "dative" ||
            DATIVE_EXPERIENCER_FORMS.has(word.original.toLowerCase())),
      ));
  if (dativeExperiencer) {
    keys.add("dative_experiencer");
    keys.add("impersonal");
  }

  const adjectives = analysis.words.filter((word) => word.partOfSpeech === "adjective");
  const nouns = analysis.words.filter((word) => word.partOfSpeech === "noun");
  if (
    adjectives.length > 0 &&
    nouns.length > 0 &&
    adjectives.some((adj) =>
      nouns.some((noun) => adj.gender && noun.gender && adj.gender === noun.gender),
    )
  ) {
    keys.add("adjective_agreement");
  }

  if (analysis.words.length >= 3 && hasFiniteVerb) {
    keys.add("word_order_svo");
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
