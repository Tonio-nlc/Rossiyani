import {
  collocationPath,
  conceptPath,
  expressionPath,
  lemmaPath,
} from "@/components/explorer/explorer-routes";
import { findCuratedCandidateExact } from "@/features/explorer/entity/curated-lookup";
import {
  isConceptExplorerEligible,
  isPhraseExplorerEligibleOrCurated,
} from "@/features/explorer/entity/explorer-eligibility";
import type { ContextTranslationGrammarConcept } from "@/lib/context-translation/types";
import { phraseLookupKey } from "@/lib/normalization/russian-key";
import { prisma } from "@/lib/prisma";

type ResolvedExplorerTarget = {
  href: string;
  exampleCount: number;
  countLabel: string;
};

function formatCountLabel(count: number, unit: "examples" | "expressions" | "concepts"): string {
  const label = count === 1 ? unit.slice(0, -1) : unit;
  return `${count} ${label}`;
}

async function resolveExplorerTarget(label: string): Promise<ResolvedExplorerTarget | null> {
  const trimmed = label.trim();
  if (!trimmed) {
    return null;
  }

  const curated = findCuratedCandidateExact(trimmed);
  if (curated) {
    if (curated.type === "WORD") {
      const lemma = await prisma.knowledgeLemma.findFirst({
        where: { lemma: { equals: curated.lemma, mode: "insensitive" } },
        select: { occurrenceCount: true },
      });
      const count = lemma?.occurrenceCount ?? 0;
      return {
        href: lemmaPath(curated.lemma, curated.partOfSpeech ?? "noun"),
        exampleCount: count,
        countLabel: formatCountLabel(Math.max(count, 1), "examples"),
      };
    }
    if (curated.type === "GRAMMAR" || curated.type === "CONSTRUCTION") {
      const concept = await prisma.knowledgeConcept.findFirst({
        where: {
          OR: [
            { conceptKey: { equals: curated.lemma, mode: "insensitive" } },
            { title: { equals: curated.lemma, mode: "insensitive" } },
          ],
        },
        select: { hitCount: true },
      });
      const count = concept?.hitCount ?? 0;
      return {
        href: conceptPath(curated.lemma),
        exampleCount: count,
        countLabel: formatCountLabel(Math.max(count, 1), "examples"),
      };
    }
    if (curated.type === "COLLOCATION") {
      const phrase = await prisma.knowledgePhrase.findUnique({
        where: { labelKey: phraseLookupKey(curated.lemma) },
        select: { occurrenceCount: true },
      });
      const count = phrase?.occurrenceCount ?? 0;
      return {
        href: collocationPath(curated.lemma),
        exampleCount: count,
        countLabel: formatCountLabel(Math.max(count, 1), "expressions"),
      };
    }
    const phrase = await prisma.knowledgePhrase.findUnique({
      where: { labelKey: phraseLookupKey(curated.lemma) },
      select: { occurrenceCount: true },
    });
    const count = phrase?.occurrenceCount ?? 0;
    return {
      href: expressionPath(curated.lemma),
      exampleCount: count,
      countLabel: formatCountLabel(Math.max(count, 1), "expressions"),
    };
  }

  const [lemma, phrase, concept] = await Promise.all([
    prisma.knowledgeLemma.findFirst({
      where: { lemma: { equals: trimmed, mode: "insensitive" } },
      select: { lemma: true, partOfSpeech: true, occurrenceCount: true },
    }),
    prisma.knowledgePhrase.findUnique({
      where: { labelKey: phraseLookupKey(trimmed) },
      select: { label: true, type: true, occurrenceCount: true },
    }),
    prisma.knowledgeConcept.findFirst({
      where: {
        OR: [
          { title: { equals: trimmed, mode: "insensitive" } },
          { conceptKey: { equals: trimmed, mode: "insensitive" } },
        ],
      },
      select: { conceptKey: true, title: true, category: true, hitCount: true },
    }),
  ]);

  if (lemma) {
    return {
      href: lemmaPath(lemma.lemma, lemma.partOfSpeech),
      exampleCount: lemma.occurrenceCount,
      countLabel: formatCountLabel(Math.max(lemma.occurrenceCount, 1), "examples"),
    };
  }

  if (
    phrase &&
    isPhraseExplorerEligibleOrCurated(phrase.label, phrase.type, false)
  ) {
    return {
      href:
        phrase.type === "COLLOCATION"
          ? collocationPath(phrase.label)
          : expressionPath(phrase.label),
      exampleCount: phrase.occurrenceCount,
      countLabel: formatCountLabel(Math.max(phrase.occurrenceCount, 1), "expressions"),
    };
  }

  if (
    concept &&
    isConceptExplorerEligible(concept.conceptKey, concept.title, concept.category)
  ) {
    return {
      href: conceptPath(concept.conceptKey),
      exampleCount: concept.hitCount,
      countLabel: formatCountLabel(Math.max(concept.hitCount, 1), "examples"),
    };
  }

  return null;
}

export async function resolveGrammarConceptForExplorer(
  label: string,
): Promise<ContextTranslationGrammarConcept> {
  const resolved = await resolveExplorerTarget(label);
  if (!resolved) {
    return {
      label: label.trim(),
      href: null,
      exampleCount: null,
      countLabel: null,
    };
  }

  return {
    label: label.trim(),
    href: resolved.href,
    exampleCount: resolved.exampleCount,
    countLabel: resolved.countLabel,
  };
}

/** @deprecated Use resolveGrammarConceptForExplorer */
export async function resolveExplorerLinkForLabel(label: string): Promise<string | null> {
  const resolved = await resolveExplorerTarget(label);
  return resolved?.href ?? null;
}
