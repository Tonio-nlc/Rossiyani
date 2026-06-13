import { deriveFrenchComparison, formatCaseLabelFr } from "@/features/grammar";
import { getEndingKnowledge } from "@/features/knowledge/get-ending-knowledge";
import { getLemmaKnowledge } from "@/features/knowledge/get-lemma-knowledge";
import { getPhraseKnowledge } from "@/features/knowledge/get-phrase-knowledge";
import { mergeRelatedTexts } from "@/features/knowledge/related-texts";
import {
  mapCase,
  mapCollocation,
  mapConcept,
  mapEnding,
  mapExpression,
  mapLemma,
  mapWordForm,
} from "@/domain/mappers";
import { isExpressionType } from "@/domain/entities/expression";
import type {
  WordDetailGraph,
  WordDetailSection,
} from "@/types/word-detail-graph";
import type { GraphConceptSummary } from "@/types/knowledge-graph";
import type {
  NeighborWordContext,
  PhraseOccurrenceContext,
  WordKnowledgeWorkspaceInput,
  WordOccurrenceContext,
} from "@/types/knowledge-workspace";
import type { PartOfSpeech } from "@/types/domain";
import type {
  KnowledgeCase,
  KnowledgeEnding,
  KnowledgeForm,
  KnowledgeLemma,
  KnowledgePhrase,
  Word,
} from "@prisma/client";

type WordWithContext = Word & {
  sentence?: { literalTranslation: string; naturalTranslation: string } | null;
  form:
    | (KnowledgeForm & {
        lemma: KnowledgeLemma & {
          conceptLinks: Array<{ concept: import("@prisma/client").KnowledgeConcept }>;
        };
      })
    | null;
};

export type ComposeWordDetailInput = {
  word: WordWithContext;
  textId: string;
  previousWord: NeighborWordContext;
  phraseOccurrence: PhraseOccurrenceContext;
  endingRow: KnowledgeEnding | null;
  caseRow: KnowledgeCase | null;
  phraseRow: KnowledgePhrase | null;
  sections: WordDetailSection[];
};

/** Backward-compatible composition from client POST payload (no wordId). */
export async function composeWordDetailFromInput(
  input: WordKnowledgeWorkspaceInput,
  sections: WordDetailSection[],
  context?: { wordId?: string; textId?: string; sentenceId?: string },
): Promise<WordDetailGraph> {
  const syntheticWord = inputToSyntheticWord(input, context?.wordId, context?.sentenceId);
  return composeWordDetailGraph({
    word: syntheticWord,
    textId: context?.textId ?? "",
    previousWord: input.previousWord ?? null,
    phraseOccurrence: input.phraseOccurrence ?? null,
    endingRow: null,
    caseRow: null,
    phraseRow: null,
    sections,
  });
}

export async function composeWordDetailGraph(
  input: ComposeWordDetailInput,
): Promise<WordDetailGraph> {
  const { word, sections } = input;
  const occurrence = mapOccurrence(word);
  const formEntity = input.word.form ? mapWordForm(input.word.form) : null;
  const lemmaEntity = input.word.form?.lemma ? mapLemma(input.word.form.lemma) : null;
  const endingEntity = input.endingRow ? mapEnding(input.endingRow) : null;
  const caseEntity = input.caseRow ? mapCase(input.caseRow) : null;

  const needsLemma = sections.some((s) =>
    ["basic", "concepts", "examples", "related", "statistics", "collocations"].includes(s),
  );
  const needsEnding = sections.some((s) => ["basic", "concepts"].includes(s));
  const needsPhrase =
    sections.includes("collocations") && Boolean(input.phraseOccurrence?.label);

  const [lemmaKnowledge, endingKnowledge, phraseKnowledge] = await Promise.all([
    needsLemma && word.partOfSpeech
      ? getLemmaKnowledge(word.lemma, word.partOfSpeech)
      : Promise.resolve(null),
    needsEnding && word.ending
      ? getEndingKnowledge(word.ending, word.case)
      : Promise.resolve(null),
    needsPhrase && input.phraseOccurrence?.label
      ? getPhraseKnowledge(input.phraseOccurrence.label)
      : Promise.resolve(null),
  ]);

  const concepts = sections.includes("concepts")
    ? dedupeConcepts([
        ...(lemmaKnowledge?.concepts ?? []),
        ...(endingKnowledge?.concepts ?? []),
        ...(phraseKnowledge?.concepts ?? []),
      ])
    : [];

  const domainConcepts =
    sections.includes("concepts") && input.word.form?.lemma
      ? input.word.form.lemma.conceptLinks.map((link) => mapConcept(link.concept))
      : [];

  const canonicalExplanation = pickFirstNonEmpty(
    lemmaKnowledge?.canonicalExplanation,
    endingKnowledge?.canonicalExplanation,
    phraseKnowledge?.canonicalExplanation,
    formEntity?.canonicalExplanation,
    word.explanation,
  );

  const grammaticalReason = pickFirstNonEmpty(
    endingKnowledge?.canonicalExplanation,
    endingEntity?.canonicalExplanation,
    lemmaKnowledge?.forms.find((f) => f.original === word.original)?.explanation,
    word.explanation,
  );

  const frenchComparisonCanonical = lemmaKnowledge?.frenchComparison ?? null;
  const frenchComparison =
    frenchComparisonCanonical === null
      ? deriveFrenchComparison(
          {
            original: word.original,
            stressMarked: word.stressMarked,
            case: word.case,
            explanation: canonicalExplanation,
            partOfSpeech: word.partOfSpeech,
          },
          input.previousWord,
        )
      : null;

  const examples = sections.includes("examples")
    ? [
        ...new Set([
          ...(lemmaKnowledge?.exampleSentences ?? []),
          ...(phraseKnowledge?.exampleSentences ?? []),
        ]),
      ]
    : [];

  const relatedTexts = sections.includes("related")
    ? mergeRelatedTexts(
        lemmaKnowledge?.relatedTexts ?? [],
        phraseKnowledge?.relatedTexts ?? [],
      )
    : [];

  const statistics = sections.includes("statistics")
    ? {
        occurrenceCount: lemmaKnowledge?.occurrenceCount ?? 0,
        seenInTexts: lemmaKnowledge?.seenInTexts ?? 0,
        libraryHitCount:
          lemmaKnowledge?.forms.find((f) => f.original === word.original)?.hitCount ??
          lemmaKnowledge?.occurrenceCount ??
          null,
        collocationCount: phraseKnowledge?.occurrenceCount ?? null,
      }
    : {
        occurrenceCount: 0,
        seenInTexts: 0,
        libraryHitCount: null,
        collocationCount: null,
      };

  const phraseRow = input.phraseRow;
  const expressionEntity =
    phraseRow && isExpressionType(phraseRow.type) ? mapExpression(phraseRow) : null;
  const collocationEntity =
    phraseRow && phraseRow.type === "COLLOCATION" ? mapCollocation(phraseRow) : null;

  return {
    wordId: word.id,
    textId: input.textId,
    sentenceId: word.sentenceId,
    occurrence,
    contextLabel: buildContextLabel(word, input.previousWord),
    canonicalExplanation,
    grammaticalReason,
    frenchComparison,
    frenchComparisonCanonical,
    literalTranslation: input.word.sentence?.literalTranslation?.trim() || null,
    naturalTranslation: input.word.sentence?.naturalTranslation?.trim() || null,
    domain: {
      form: formEntity,
      lemma: lemmaEntity,
      ending: endingEntity,
      case: caseEntity,
      concepts: domainConcepts,
      expression: expressionEntity,
      collocation: collocationEntity,
    },
    lemmaKnowledge: sections.includes("statistics") || sections.includes("examples")
      ? lemmaKnowledge
      : lemmaKnowledge,
    endingKnowledge: needsEnding ? endingKnowledge : null,
    phraseKnowledge: sections.includes("collocations") ? phraseKnowledge : null,
    phraseOccurrence: input.phraseOccurrence,
    concepts,
    relatedTexts,
    examples,
    statistics,
    loadedSections: sections,
  };
}

function mapOccurrence(word: Word): WordOccurrenceContext {
  const alternatives = parseTranslationAlternatives(word.translationAlternatives);
  return {
    original: word.original,
    stressMarked: word.stressMarked,
    lemma: word.lemma,
    partOfSpeech: word.partOfSpeech as PartOfSpeech,
    stem: word.stem,
    ending: word.ending,
    case: word.case,
    gender: word.gender,
    number: word.number,
    tense: word.tense,
    aspect: word.aspect,
    explanation: word.explanation,
    frequency: word.frequency,
    translationCanonical: word.translationCanonical?.trim() || null,
    translationAlternatives: alternatives,
  };
}

function parseTranslationAlternatives(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim());
}

function buildContextLabel(
  word: Word,
  previousWord: NeighborWordContext,
): string | null {
  if (previousWord?.partOfSpeech === "preposition" && word.case) {
    const caseFr = formatCaseLabelFr(word.case);
    return caseFr
      ? `${previousWord.original} + ${caseFr}`
      : `${previousWord.original} + …`;
  }
  return null;
}

function dedupeConcepts(concepts: GraphConceptSummary[]): GraphConceptSummary[] {
  const map = new Map<string, GraphConceptSummary>();
  for (const concept of concepts) {
    map.set(concept.id, concept);
  }
  return [...map.values()];
}

function pickFirstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    if (value && value.trim().length > 0) {
      return value;
    }
  }
  return "";
}

function inputToSyntheticWord(
  input: WordKnowledgeWorkspaceInput,
  wordId?: string,
  sentenceId?: string,
): WordWithContext {
  return {
    id: wordId ?? "synthetic",
    sentenceId: sentenceId ?? "synthetic",
    formId: null,
    position: 0,
    original: input.original,
    lemma: input.lemma,
    stressMarked: input.stressMarked,
    stem: input.stem,
    ending: input.ending,
    partOfSpeech: input.partOfSpeech,
    case: input.case,
    gender: input.gender,
    number: input.number,
    tense: input.tense,
    aspect: input.aspect,
    explanation: input.explanation,
    frequency: input.frequency as Word["frequency"],
    frequencyTier: null,
    translationCanonical: input.translationCanonical ?? null,
    translationAlternatives: input.translationAlternatives ?? [],
    form: null,
  };
}
