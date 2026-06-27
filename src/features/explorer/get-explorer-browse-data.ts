import type { PartOfSpeech } from "@prisma/client";

import { casePath, collocationPath, conceptPath, endingPath, expressionPath, lemmaPath } from "@/components/explorer/explorer-routes";
import { CASE_LEGEND_ENTRIES } from "@/features/grammar/case-legend-data";
import { formatPosLabelFr, pickLemmaTranslation } from "@/lib/explorer/lemma-display";
import { observedInContexts, patternObservedInTexts } from "@/lib/explorer/explorer-ia";
import { firstSentence } from "@/features/explorer/entity/types";
import { LEARNABLE_LEMMA_WHERE } from "@/lib/linguistics/lexical-metadata";
import { prisma } from "@/lib/prisma";

export type LemmaBrowseCard = {
  kind: "lemma";
  lemma: string;
  partOfSpeech: PartOfSpeech;
  href: string;
  categoryLabel: string;
  occurrenceCount: number;
  contextPreview: string | null;
};

export type ConceptBrowseCard = {
  kind: "concept";
  title: string;
  href: string;
  description: string;
  exampleCount: number;
  relatedLabels: string[];
};

export type CaseBrowseCard = {
  kind: "case";
  title: string;
  href: string;
  description: string;
  exampleCount: number;
  textCount: number;
};

export type PortalBrowseCard = {
  kind: "portal";
  title: string;
  href: string;
  description: string;
  examples?: string[];
  context?: string;
  portalKind?: "category" | "entity";
};

function trimPreview(sentence: string, max = 72): string {
  const trimmed = sentence.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1)}…`;
}

function formatConceptTitle(title: string): string {
  return title.replace(/\s+case$/i, "").trim();
}

function conceptDescription(
  frenchComparison: string | null,
  canonicalExplanation: string,
): string {
  if (frenchComparison?.trim()) {
    return firstSentence(frenchComparison.trim());
  }
  return firstSentence(canonicalExplanation);
}

function caseDescription(question: string): string {
  const cleaned = question
    .replace(/^Qui \? Quoi \? \(sujet\)$/i, "Sujet de l'action.")
    .replace(/^Qui \? Quoi \? \(complément\)$/i, "Complément d'objet direct.")
    .replace(/\s*\(.*\)\s*$/, "")
    .trim();
  return cleaned.endsWith(".") ? cleaned : `${cleaned}.`;
}

export async function getLemmaBrowseCards(limit = 12): Promise<LemmaBrowseCard[]> {
  const rows = await prisma.knowledgeLemma.findMany({
    where: LEARNABLE_LEMMA_WHERE,
    orderBy: { occurrenceCount: "desc" },
    take: limit,
    select: {
      lemma: true,
      partOfSpeech: true,
      occurrenceCount: true,
      occurrences: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { sentenceRussian: true },
      },
    },
  });

  return rows.map((row) => ({
    kind: "lemma",
    lemma: row.lemma,
    partOfSpeech: row.partOfSpeech,
    href: lemmaPath(row.lemma, row.partOfSpeech),
    categoryLabel: formatPosLabelFr(row.partOfSpeech),
    occurrenceCount: row.occurrenceCount,
    contextPreview: row.occurrences[0]?.sentenceRussian
      ? trimPreview(row.occurrences[0].sentenceRussian)
      : null,
  }));
}

export async function getConceptBrowseCards(limit = 12): Promise<ConceptBrowseCard[]> {
  const rows = await prisma.knowledgeConcept.findMany({
    where: {
      category: { not: "GRAMMATICAL_CASE" },
      NOT: { conceptKey: { startsWith: "case:" } },
    },
    orderBy: { hitCount: "desc" },
    take: limit,
    select: {
      conceptKey: true,
      title: true,
      canonicalExplanation: true,
      frenchComparison: true,
      hitCount: true,
      relatedFrom: {
        take: 4,
        select: {
          toConcept: {
            select: { title: true },
          },
        },
      },
    },
  });

  return rows.map((row) => ({
    kind: "concept",
    title: formatConceptTitle(row.title),
    href: conceptPath(row.conceptKey),
    description: conceptDescription(row.frenchComparison, row.canonicalExplanation),
    exampleCount: row.hitCount,
    relatedLabels: row.relatedFrom
      .map((link) => formatConceptTitle(link.toConcept.title))
      .filter((label, index, list) => list.indexOf(label) === index)
      .slice(0, 3),
  }));
}

async function getCaseStats(caseKey: string): Promise<{ exampleCount: number; textCount: number }> {
  const forms = await prisma.knowledgeForm.findMany({
    where: { case: caseKey },
    select: { id: true },
  });
  const formIds = forms.map((form) => form.id);

  if (formIds.length === 0) {
    return { exampleCount: 0, textCount: 0 };
  }

  const [exampleCount, textGroups] = await Promise.all([
    prisma.knowledgeOccurrence.count({ where: { formId: { in: formIds } } }),
    prisma.knowledgeOccurrence.groupBy({
      by: ["textId"],
      where: { formId: { in: formIds }, textId: { not: null } },
    }),
  ]);

  return { exampleCount, textCount: textGroups.length };
}

export async function getCaseBrowseCards(): Promise<CaseBrowseCard[]> {
  return Promise.all(
    CASE_LEGEND_ENTRIES.map(async (entry) => {
      const stats = await getCaseStats(entry.key);

      return {
        kind: "case" as const,
        title: entry.frenchName,
        href: casePath(entry.key),
        description: caseDescription(entry.question),
        exampleCount: stats.exampleCount,
        textCount: stats.textCount,
      };
    }),
  );
}

export async function getEndingBrowseCards(limit = 12) {
  const rows = await prisma.knowledgeEnding.findMany({
    orderBy: { hitCount: "desc" },
    take: limit,
    select: {
      ending: true,
      caseKey: true,
      hitCount: true,
      explanationFr: true,
    },
  });

  return rows.map((row) => ({
    kind: "portal" as const,
    portalKind: "entity" as const,
    title: `-${row.ending}`,
    href: endingPath(row.ending, row.caseKey),
    description: firstSentence(row.explanationFr),
    context: observedInContexts(row.hitCount),
  }));
}

export async function getCollocationBrowseCards(limit = 12) {
  const rows = await prisma.knowledgePhrase.findMany({
    where: { type: "COLLOCATION" },
    orderBy: { occurrenceCount: "desc" },
    take: limit,
    select: {
      label: true,
      occurrenceCount: true,
      canonicalExplanation: true,
      explanation: true,
    },
  });

  return rows.map((row) => ({
    kind: "portal" as const,
    portalKind: "entity" as const,
    title: row.label,
    href: collocationPath(row.label),
    description: firstSentence(row.canonicalExplanation ?? row.explanation),
    context: observedInContexts(row.occurrenceCount),
  }));
}

export async function getExpressionBrowseCards(limit = 12) {
  const rows = await prisma.knowledgePhrase.findMany({
    where: { type: { in: ["FIXED_EXPRESSION", "NATIVE_CONSTRUCTION"] } },
    orderBy: { occurrenceCount: "desc" },
    take: limit,
    select: {
      label: true,
      occurrenceCount: true,
      canonicalExplanation: true,
      explanation: true,
    },
  });

  return rows.map((row) => ({
    kind: "portal" as const,
    portalKind: "entity" as const,
    title: row.label,
    href: expressionPath(row.label),
    description: firstSentence(row.canonicalExplanation ?? row.explanation),
    context: observedInContexts(row.occurrenceCount),
  }));
}

export async function getRandomDiscoveryCard(): Promise<PortalBrowseCard | null> {
  const dayBucket = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const [lemmaRows, conceptRows] = await Promise.all([
    prisma.knowledgeLemma.findMany({
      where: LEARNABLE_LEMMA_WHERE,
      orderBy: { occurrenceCount: "desc" },
      take: 10,
      select: {
        lemma: true,
        partOfSpeech: true,
        frenchComparison: true,
        occurrenceCount: true,
      },
    }),
    prisma.knowledgeConcept.findMany({
      where: {
        category: { not: "GRAMMATICAL_CASE" },
        NOT: { conceptKey: { startsWith: "case:" } },
      },
      orderBy: { hitCount: "desc" },
      take: 8,
      select: {
        conceptKey: true,
        title: true,
        canonicalExplanation: true,
        hitCount: true,
      },
    }),
  ]);

  const pool: PortalBrowseCard[] = [
    ...lemmaRows.map((row) => {
      const translation = pickLemmaTranslation(row.frenchComparison);
      return {
        kind: "portal" as const,
        portalKind: "entity" as const,
        title: row.lemma,
        href: lemmaPath(row.lemma, row.partOfSpeech),
        description: translation ?? "Word from your reading library",
        context: observedInContexts(row.occurrenceCount),
      };
    }),
    ...conceptRows.map((row) => ({
      kind: "portal" as const,
      portalKind: "entity" as const,
      title: formatConceptTitle(row.title),
      href: conceptPath(row.conceptKey),
      description: firstSentence(row.canonicalExplanation),
      context: patternObservedInTexts(row.hitCount),
    })),
  ];

  if (pool.length === 0) {
    return null;
  }

  return pool[dayBucket % pool.length] ?? pool[0] ?? null;
}
