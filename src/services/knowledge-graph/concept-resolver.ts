import type { KnowledgeConceptCategory } from "@prisma/client";

import {
  formatCaseTitleFr,
  normalizeCaseKey,
  type CaseKey,
} from "@/lib/grammar/normalize-case-key";
import {
  caseLookupKey,
  conceptLookupKey,
  endingLookupKey,
  formLookupKey,
  phraseLookupKey,
  prepositionPatternKey,
  sentenceLookupKey,
} from "@/lib/normalization/russian-key";
import { prisma } from "@/lib/prisma";
import type { SentenceAnalysisOutput } from "@/services/ai/schemas";

type EnsureConceptInput = {
  conceptKey: string;
  title: string;
  canonicalExplanation: string;
  category: KnowledgeConceptCategory;
  frenchComparison?: string | null;
};

/**
 * Ensures canonical concepts exist and links them to graph nodes inferred from analysis.
 */
export async function resolveConceptsFromAnalysis(
  analysis: SentenceAnalysisOutput,
): Promise<number> {
  let linked = 0;

  for (const word of analysis.words) {
    const formKey = formLookupKey(word.original);
    const formRow = await prisma.knowledgeForm.findUnique({ where: { originalKey: formKey } });
    if (!formRow) {
      continue;
    }

    const lemmaRow = await prisma.knowledgeLemma.findUnique({ where: { id: formRow.lemmaId } });
    if (!lemmaRow) {
      continue;
    }

    const caseKey = normalizeCaseKey(word.case);
    if (caseKey) {
      const caseConcept = await ensureCaseConcept(caseKey);
      linked += await linkLemmaConcept(lemmaRow.id, caseConcept.id);
      linked += await linkFormCase(lemmaRow.id, formRow.id, caseKey, caseConcept.id);

      if (word.ending) {
        const eKey = endingLookupKey(word.ending, word.case);
        const endingRow = await prisma.knowledgeEnding.findUnique({ where: { endingKey: eKey } });
        if (endingRow) {
          linked += await linkEndingConcept(endingRow.id, caseConcept.id);
        }
      }
    }
  }

  linked += await resolvePrepositionPatterns(analysis);

  for (const group of analysis.phraseGroups) {
    const phraseKey = phraseLookupKey(group.label);
    const phraseRow = await prisma.knowledgePhrase.findUnique({ where: { labelKey: phraseKey } });
    if (!phraseRow) {
      continue;
    }

    const concept = await ensureConcept({
      conceptKey: conceptLookupKey(`${group.type}:${group.label}`),
      title: group.label,
      canonicalExplanation: group.explanation,
      category:
        group.type === "NATIVE_CONSTRUCTION"
          ? "CONSTRUCTION"
          : group.type === "FIXED_EXPRESSION"
            ? "GRAMMAR_PATTERN"
            : "SEMANTIC",
    });
    linked += await linkPhraseConcept(phraseRow.id, concept.id);
  }

  return linked;
}

async function resolvePrepositionPatterns(analysis: SentenceAnalysisOutput): Promise<number> {
  let linked = 0;
  const sorted = [...analysis.words].sort((a, b) => a.position - b.position);

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]!;
    const next = sorted[i + 1]!;

    if (current.partOfSpeech !== "preposition") {
      continue;
    }

    const nextCase = normalizeCaseKey(next.case);
    if (!nextCase) {
      continue;
    }

    const patternKey = prepositionPatternKey(current.original, nextCase);
    const title = `${current.original} + ${formatCaseTitleFr(nextCase).toLowerCase()}`;
    const concept = await ensureConcept({
      conceptKey: patternKey,
      title,
      canonicalExplanation: `Construction « ${current.original} » suivie du ${formatCaseTitleFr(nextCase).toLowerCase()} — modèle fréquent en russe.`,
      category: "PREPOSITION_PATTERN",
      frenchComparison: `En français, la préposition et le cas ne se voient pas sur le nom ; en russe, la terminaison du nom confirme le cas après « ${current.original} ».`,
    });

    const formKey = formLookupKey(next.original);
    const formRow = await prisma.knowledgeForm.findUnique({ where: { originalKey: formKey } });
    if (formRow) {
      linked += await linkLemmaConcept(formRow.lemmaId, concept.id);
    }
    linked += 1;
  }

  return linked;
}

async function ensureCaseConcept(caseKey: CaseKey) {
  const title = `${formatCaseTitleFr(caseKey)} case`;
  const caseNode = await ensureCaseNode(caseKey);

  return ensureConcept({
    conceptKey: conceptLookupKey(`case:${caseKey}`),
    title,
    canonicalExplanation:
      caseNode.canonicalExplanation ??
      `Cas ${formatCaseTitleFr(caseKey).toLowerCase()} — notion grammaticale réutilisable entre les textes.`,
    category: "GRAMMATICAL_CASE",
    frenchComparison: null,
  });
}

async function ensureCaseNode(caseKey: CaseKey) {
  const key = caseLookupKey(caseKey);
  return prisma.knowledgeCase.upsert({
    where: { caseKey: key },
    create: {
      caseKey: key,
      titleFr: formatCaseTitleFr(caseKey),
      hitCount: 1,
    },
    update: {
      hitCount: { increment: 1 },
    },
  });
}

async function linkFormCase(
  lemmaId: string,
  formId: string,
  caseKey: CaseKey,
  conceptId: string,
): Promise<number> {
  const caseNode = await prisma.knowledgeCase.findUnique({
    where: { caseKey: caseLookupKey(caseKey) },
  });
  if (!caseNode) {
    return 0;
  }

  if (!caseNode.conceptId) {
    await prisma.knowledgeCase.update({
      where: { id: caseNode.id },
      data: { conceptId },
    });
  }

  await linkLemmaConcept(lemmaId, conceptId);
  void formId;
  return 1;
}

async function ensureConcept(input: EnsureConceptInput) {
  const row = await prisma.knowledgeConcept.upsert({
    where: { conceptKey: input.conceptKey },
    create: {
      conceptKey: input.conceptKey,
      title: input.title,
      canonicalExplanation: input.canonicalExplanation,
      category: input.category,
      frenchComparison: input.frenchComparison ?? null,
      hitCount: 1,
    },
    update: {
      hitCount: { increment: 1 },
      title: input.title,
    },
  });

  return row;
}

async function linkLemmaConcept(lemmaId: string, conceptId: string): Promise<number> {
  await prisma.knowledgeLemmaConcept.upsert({
    where: { lemmaId_conceptId: { lemmaId, conceptId } },
    create: { lemmaId, conceptId },
    update: {},
  });
  return 1;
}

async function linkEndingConcept(endingId: string, conceptId: string): Promise<number> {
  await prisma.knowledgeEndingConcept.upsert({
    where: { endingId_conceptId: { endingId, conceptId } },
    create: { endingId, conceptId },
    update: {},
  });
  return 1;
}

async function linkPhraseConcept(phraseId: string, conceptId: string): Promise<number> {
  await prisma.knowledgePhraseConcept.upsert({
    where: { phraseId_conceptId: { phraseId, conceptId } },
    create: { phraseId, conceptId },
    update: {},
  });
  return 1;
}

/** Links related case concepts (e.g. prepositional ↔ locative) when both exist. */
export async function linkRelatedCaseConcepts(): Promise<void> {
  const pairs: Array<[CaseKey, CaseKey]> = [
    ["prepositional", "locative"],
    ["accusative", "genitive"],
  ];

  for (const [from, to] of pairs) {
    const fromConcept = await prisma.knowledgeConcept.findUnique({
      where: { conceptKey: conceptLookupKey(`case:${from}`) },
    });
    const toConcept = await prisma.knowledgeConcept.findUnique({
      where: { conceptKey: conceptLookupKey(`case:${to}`) },
    });
    if (!fromConcept || !toConcept) {
      continue;
    }

    await prisma.knowledgeConceptRelation.upsert({
      where: {
        fromConceptId_toConceptId_relationType: {
          fromConceptId: fromConcept.id,
          toConceptId: toConcept.id,
          relationType: "related",
        },
      },
      create: {
        fromConceptId: fromConcept.id,
        toConceptId: toConcept.id,
        relationType: "related",
      },
      update: {},
    });
  }
}

export function sentenceKeyForMerge(russianText: string): string {
  return sentenceLookupKey(russianText);
}
