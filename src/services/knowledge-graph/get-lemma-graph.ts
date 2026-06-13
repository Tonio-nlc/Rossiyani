import type { PartOfSpeech } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { LemmaGraph } from "@/types/knowledge-graph";

import {
  mapCaseRow,
  mapConceptRow,
  mapEndingRow,
  mapFormRow,
  mapLemmaRow,
  mapOccurrenceRow,
  mapPhraseRow,
} from "./graph-mappers";

function resolveDominantAspect(
  forms: Array<{ aspect: string | null; occurrenceCount: number }>,
): string | null {
  const counts = new Map<string, number>();
  for (const form of forms) {
    const aspect = form.aspect?.trim();
    if (!aspect) {
      continue;
    }
    const key = aspect.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + form.occurrenceCount);
  }
  if (counts.size === 0) {
    return null;
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
}

function oppositeAspectFragment(aspect: string | null): string | null {
  if (!aspect) {
    return null;
  }
  const normalized = aspect.toLowerCase();
  if (normalized.includes("imperf")) {
    return "perf";
  }
  if (normalized.includes("perf")) {
    return "imperf";
  }
  return null;
}

export async function getLemmaGraph(
  lemma: string,
  partOfSpeech: PartOfSpeech,
): Promise<LemmaGraph | null> {
  const lemmaRow = await prisma.knowledgeLemma.findUnique({
    where: { lemma_partOfSpeech: { lemma, partOfSpeech } },
    include: {
      forms: { orderBy: { occurrenceCount: "desc" } },
      occurrences: { orderBy: { createdAt: "desc" }, take: 50 },
      conceptLinks: { include: { concept: true } },
      phraseLinks: { include: { phrase: true } },
    },
  });

  if (!lemmaRow) {
    return null;
  }

  const endingKeys = new Set(
    lemmaRow.forms.filter((f) => f.ending).map((f) => `${f.ending}|${f.case ?? "_"}`),
  );
  const endings = await prisma.knowledgeEnding.findMany({
    where: { endingKey: { in: [...endingKeys] } },
    orderBy: { hitCount: "desc" },
  });

  const caseKeys = [
    ...new Set(
      lemmaRow.forms
        .map((f) => f.case)
        .filter((c): c is string => Boolean(c)),
    ),
  ];
  const cases = await prisma.knowledgeCase.findMany({
    where: { caseKey: { in: caseKeys } },
    include: { concept: true },
  });

  const phraseOccurrences = await prisma.knowledgePhraseOccurrence.findMany({
    where: {
      sentenceKey: { in: [...new Set(lemmaRow.occurrences.map((o) => o.sentenceKey))] },
    },
    include: { phrase: true },
    take: 20,
  });

  const concepts = lemmaRow.conceptLinks.map((l) => mapConceptRow(l.concept));
  const conceptIds = lemmaRow.conceptLinks.map((l) => l.conceptId);
  const dominantAspect = resolveDominantAspect(lemmaRow.forms);
  const relatedConceptIds = new Set<string>();
  for (const concept of concepts) {
    const relations = await prisma.knowledgeConceptRelation.findMany({
      where: { fromConceptId: concept.id },
      include: { toConcept: true },
    });
    for (const rel of relations) {
      if (!concepts.some((c) => c.id === rel.toConcept.id)) {
        relatedConceptIds.add(rel.toConcept.id);
      }
    }
  }
  const relatedConcepts = relatedConceptIds.size
    ? (await prisma.knowledgeConcept.findMany({ where: { id: { in: [...relatedConceptIds] } } })).map(
        mapConceptRow,
      )
    : [];

  const distinctTexts = new Set(
    lemmaRow.occurrences.map((o) => o.textId).filter((id): id is string => Boolean(id)),
  );

  const familyLemmaRows =
    conceptIds.length > 0
      ? await prisma.knowledgeLemma.findMany({
          where: {
            id: { not: lemmaRow.id },
            conceptLinks: { some: { conceptId: { in: conceptIds } } },
          },
          orderBy: { occurrenceCount: "desc" },
          take: 12,
        })
      : [];

  const aspectFragment = oppositeAspectFragment(dominantAspect);
  const aspectPartnerRow =
    partOfSpeech === "verb" && aspectFragment && conceptIds.length > 0
      ? await prisma.knowledgeLemma.findFirst({
          where: {
            id: { not: lemmaRow.id },
            partOfSpeech: "verb",
            conceptLinks: { some: { conceptId: { in: conceptIds } } },
            forms: { some: { aspect: { contains: aspectFragment } } },
          },
          orderBy: { occurrenceCount: "desc" },
        })
      : null;

  const linkedPhraseMap = new Map<string, ReturnType<typeof mapPhraseRow>>();
  for (const link of lemmaRow.phraseLinks) {
    linkedPhraseMap.set(link.phrase.id, mapPhraseRow(link.phrase));
  }
  for (const occurrence of phraseOccurrences) {
    linkedPhraseMap.set(occurrence.phrase.id, mapPhraseRow(occurrence.phrase));
  }

  return {
    lemma: mapLemmaRow(lemmaRow),
    forms: lemmaRow.forms.map(mapFormRow),
    endings: endings.map(mapEndingRow),
    cases: cases.map((c) => mapCaseRow(c, c.concept)),
    phrases: [...linkedPhraseMap.values()].sort((a, b) => b.occurrenceCount - a.occurrenceCount),
    concepts,
    occurrences: lemmaRow.occurrences.map(mapOccurrenceRow),
    exampleSentences: [...new Set(lemmaRow.occurrences.map((o) => o.sentenceRussian))],
    relatedConcepts,
    familyLemmas: familyLemmaRows.map(mapLemmaRow),
    aspectPartner: aspectPartnerRow ? mapLemmaRow(aspectPartnerRow) : null,
    dominantAspect,
    stats: {
      formCount: lemmaRow.forms.length,
      occurrenceCount: lemmaRow.occurrenceCount,
      distinctTexts: distinctTexts.size,
    },
  };
}
