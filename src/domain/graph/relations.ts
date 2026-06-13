/**
 * Knowledge Graph relation types — mirrors prisma/schema.prisma join tables.
 */

export type LemmaToWordForms = {
  lemmaId: string;
  formIds: string[];
};

export type LemmaToExpressions = {
  lemmaId: string;
  phraseIds: string[];
};

export type CaseToEndings = {
  caseId: string;
  endingIds: string[];
};

export type ConceptToSentences = {
  conceptId: string;
  sentenceIds: string[];
};

export type ConceptToLemmas = {
  conceptId: string;
  lemmaIds: string[];
};

export type ExpressionToSentences = {
  phraseId: string;
  sentenceIds: string[];
};

export type SentenceToText = {
  sentenceId: string;
  textId: string;
};

/** Full graph adjacency for a lemma node. */
export type LemmaGraphRelations = {
  lemmaId: string;
  formIds: string[];
  expressionIds: string[];
  conceptIds: string[];
  occurrenceIds: string[];
};

/** Full graph adjacency for a sentence node. */
export type SentenceGraphRelations = {
  sentenceId: string;
  textId: string;
  formIds: string[];
  expressionIds: string[];
  collocationIds: string[];
  conceptIds: string[];
};
