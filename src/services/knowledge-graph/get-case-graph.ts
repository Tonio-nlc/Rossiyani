import { caseLookupKey } from "@/lib/normalization/russian-key";
import { normalizeCaseKey } from "@/lib/grammar/normalize-case-key";
import { prisma } from "@/lib/prisma";
import type { CaseGraph } from "@/types/knowledge-graph";

import {
  mapCaseRow,
  mapConceptRow,
  mapEndingRow,
  mapFormRow,
  mapLemmaRow,
  mapOccurrenceRow,
} from "./graph-mappers";

export async function getCaseGraph(rawCaseKey: string): Promise<CaseGraph | null> {
  const normalized = normalizeCaseKey(rawCaseKey);
  const lookupKey = caseLookupKey(normalized ?? rawCaseKey);

  const caseNode = await prisma.knowledgeCase.findUnique({
    where: { caseKey: lookupKey },
    include: { concept: true },
  });

  if (!caseNode) {
    return null;
  }

  const endings = await prisma.knowledgeEnding.findMany({
    where: { caseKey: lookupKey },
    orderBy: { hitCount: "desc" },
    take: 100,
  });

  const forms = await prisma.knowledgeForm.findMany({
    where: { case: lookupKey },
    include: { lemma: true },
    orderBy: { occurrenceCount: "desc" },
    take: 100,
  });

  const occurrences = await prisma.knowledgeOccurrence.findMany({
    where: { formId: { in: forms.map((f) => f.id) } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const concepts = caseNode.concept
    ? [mapConceptRow(caseNode.concept)]
    : [];

  const lemmaMap = new Map(forms.map((f) => [f.lemma.id, f.lemma]));

  return {
    caseNode: mapCaseRow(caseNode, caseNode.concept),
    endings: endings.map(mapEndingRow),
    forms: forms.map(mapFormRow),
    lemmas: [...lemmaMap.values()].map(mapLemmaRow),
    concepts,
    occurrences: occurrences.map(mapOccurrenceRow),
    stats: {
      endingCount: endings.length,
      formCount: forms.length,
      occurrenceCount: occurrences.length,
    },
  };
}
