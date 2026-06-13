import { endingLookupKey } from "@/lib/normalization/russian-key";
import { prisma } from "@/lib/prisma";
import type { EndingGraph } from "@/types/knowledge-graph";

import {
  mapCaseRow,
  mapConceptRow,
  mapEndingRow,
  mapFormRow,
  mapLemmaRow,
  mapOccurrenceRow,
} from "./graph-mappers";

export async function getEndingGraph(
  ending: string,
  grammaticalCase?: string | null,
): Promise<EndingGraph | null> {
  const key = endingLookupKey(ending, grammaticalCase);
  const endingRow = await prisma.knowledgeEnding.findUnique({
    where: { endingKey: key },
    include: {
      conceptLinks: { include: { concept: true } },
    },
  });

  if (!endingRow) {
    return null;
  }

  const forms = await prisma.knowledgeForm.findMany({
    where: { ending, case: grammaticalCase ?? endingRow.caseKey },
    include: { lemma: true },
    orderBy: { occurrenceCount: "desc" },
    take: 100,
  });

  const occurrences = await prisma.knowledgeOccurrence.findMany({
    where: { formId: { in: forms.map((f) => f.id) } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const caseNode = await prisma.knowledgeCase.findUnique({
    where: { caseKey: endingRow.caseKey },
    include: { concept: true },
  });

  const lemmaMap = new Map(forms.map((f) => [f.lemma.id, f.lemma]));

  return {
    ending: mapEndingRow(endingRow),
    forms: forms.map(mapFormRow),
    lemmas: [...lemmaMap.values()].map(mapLemmaRow),
    cases: caseNode ? [mapCaseRow(caseNode, caseNode.concept)] : [],
    concepts: endingRow.conceptLinks.map((l) => mapConceptRow(l.concept)),
    occurrences: occurrences.map(mapOccurrenceRow),
    stats: {
      formCount: forms.length,
      lemmaCount: lemmaMap.size,
      occurrenceCount: occurrences.length,
    },
  };
}
