import type {
  KnowledgeCase,
  KnowledgeConcept,
  KnowledgeEnding,
  KnowledgeForm,
  KnowledgeLemma,
  KnowledgePhrase,
  Word,
} from "@prisma/client";

import type {
  CaseEntity,
  CollocationEntity,
  ConceptEntity,
  EndingEntity,
  ExpressionEntity,
  LemmaEntity,
  WordFormEntity,
} from "@/domain/entities";
import { isExpressionType } from "@/domain/entities/expression";
import type { CulturalNote, SyntaxAnalysis } from "@/domain/pipeline";
import type { SentenceEntity } from "@/domain/entities/sentence";

export function mapLemma(row: KnowledgeLemma): LemmaEntity {
  return {
    id: row.id,
    lemma: row.lemma,
    partOfSpeech: row.partOfSpeech,
    stressMarked: row.stressMarked,
    frequency: row.frequency,
    frequencyTier: row.frequencyTier,
    occurrenceCount: row.occurrenceCount,
    canonicalExplanation: row.canonicalExplanation,
    frenchComparison: row.frenchComparison,
    reviewStatus: row.reviewStatus,
  };
}

export function mapWordForm(row: KnowledgeForm): WordFormEntity {
  return {
    id: row.id,
    lemmaId: row.lemmaId,
    original: row.original,
    stressMarked: row.stressMarked,
    stem: row.stem,
    ending: row.ending,
    partOfSpeech: row.partOfSpeech,
    case: row.case,
    gender: row.gender,
    number: row.number,
    tense: row.tense,
    aspect: row.aspect,
    explanation: row.explanation,
    canonicalExplanation: row.canonicalExplanation,
    hitCount: row.hitCount,
    occurrenceCount: row.occurrenceCount,
    reviewStatus: row.reviewStatus,
    frequency: null,
    frequencyTier: null,
  };
}

export function mapEnding(row: KnowledgeEnding): EndingEntity {
  return {
    id: row.id,
    ending: row.ending,
    caseKey: row.caseKey,
    caseId: row.caseId,
    partOfSpeech: row.partOfSpeech,
    explanationFr: row.explanationFr,
    canonicalExplanation: row.canonicalExplanation,
    hitCount: row.hitCount,
    reviewStatus: row.reviewStatus,
  };
}

export function mapCase(row: KnowledgeCase): CaseEntity {
  return {
    id: row.id,
    caseKey: row.caseKey,
    titleFr: row.titleFr,
    canonicalExplanation: row.canonicalExplanation,
    reviewStatus: row.reviewStatus,
    hitCount: row.hitCount,
    conceptId: row.conceptId,
  };
}

export function mapConcept(row: KnowledgeConcept): ConceptEntity {
  return {
    id: row.id,
    conceptKey: row.conceptKey,
    title: row.title,
    canonicalExplanation: row.canonicalExplanation,
    category: row.category,
    frenchComparison: row.frenchComparison,
    commonMistakes: row.commonMistakesJson ? JSON.parse(row.commonMistakesJson) : null,
    reviewStatus: row.reviewStatus,
    hitCount: row.hitCount,
  };
}

export function mapExpression(row: KnowledgePhrase): ExpressionEntity {
  if (!isExpressionType(row.type)) {
    throw new Error(`KnowledgePhrase ${row.id} is not an expression (type=${row.type})`);
  }
  return {
    id: row.id,
    label: row.label,
    type: row.type,
    explanation: row.explanation,
    canonicalExplanation: row.canonicalExplanation,
    hitCount: row.hitCount,
    occurrenceCount: row.occurrenceCount,
    reviewStatus: row.reviewStatus,
  };
}

export function mapCollocation(row: KnowledgePhrase): CollocationEntity {
  if (row.type !== "COLLOCATION") {
    throw new Error(`KnowledgePhrase ${row.id} is not a collocation (type=${row.type})`);
  }
  return {
    id: row.id,
    label: row.label,
    explanation: row.explanation,
    canonicalExplanation: row.canonicalExplanation,
    hitCount: row.hitCount,
    occurrenceCount: row.occurrenceCount,
    reviewStatus: row.reviewStatus,
  };
}

export function parseSyntaxAnalysis(json: string | null): SyntaxAnalysis | null {
  if (!json) {
    return null;
  }
  return JSON.parse(json) as SyntaxAnalysis;
}

export function parseCulturalNotes(json: string | null): CulturalNote[] {
  if (!json) {
    return [];
  }
  return JSON.parse(json) as CulturalNote[];
}

export function mapSentence(
  row: {
    id: string;
    textId: string;
    position: number;
    russianText: string;
    literalTranslation: string;
    naturalTranslation: string;
    russianLogic: string;
    orderExplanation: string;
    nativeUsageNotes: string;
    register: SentenceEntity["register"];
    difficultyScore: SentenceEntity["difficultyScore"];
    needsReview: boolean;
    reviewMessage: string | null;
    syntaxAnalysisJson: string | null;
    culturalNotesJson: string | null;
  },
): SentenceEntity {
  return {
    id: row.id,
    textId: row.textId,
    position: row.position,
    russianText: row.russianText,
    literalTranslation: row.literalTranslation,
    naturalTranslation: row.naturalTranslation,
    russianLogic: row.russianLogic,
    orderExplanation: row.orderExplanation,
    nativeUsageNotes: row.nativeUsageNotes,
    register: row.register,
    difficultyScore: row.difficultyScore as SentenceEntity["difficultyScore"],
    needsReview: row.needsReview,
    reviewMessage: row.reviewMessage,
    syntaxAnalysis: parseSyntaxAnalysis(row.syntaxAnalysisJson),
    culturalNotes: parseCulturalNotes(row.culturalNotesJson),
  };
}

export function mapWordInstance(
  word: Word,
  form: KnowledgeForm | null,
  lemma: KnowledgeLemma | null,
  ending: KnowledgeEnding | null,
): {
  wordId: string;
  position: number;
  original: string;
  explanation: string;
  form: WordFormEntity | null;
  lemma: LemmaEntity | null;
  ending: EndingEntity | null;
} {
  return {
    wordId: word.id,
    position: word.position,
    original: word.original,
    explanation: form?.canonicalExplanation ?? form?.explanation ?? word.explanation,
    form: form ? mapWordForm(form) : null,
    lemma: lemma ? mapLemma(lemma) : null,
    ending: ending ? mapEnding(ending) : null,
  };
}
