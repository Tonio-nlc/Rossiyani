import { conceptLookupKey } from "@/lib/normalization/russian-key";
import { prisma } from "@/lib/prisma";
import type { ConceptGraph } from "@/types/knowledge-graph";

import {
  mapCaseRow,
  mapConceptRow,
  mapEndingRow,
  mapLemmaRow,
  mapPhraseRow,
} from "./graph-mappers";

export async function getConceptGraph(
  conceptKeyOrTitle: string,
): Promise<ConceptGraph | null> {
  const key = conceptLookupKey(conceptKeyOrTitle);
  const concept = await prisma.knowledgeConcept.findFirst({
    where: {
      OR: [{ conceptKey: key }, { conceptKey: conceptKeyOrTitle }, { title: conceptKeyOrTitle }],
    },
  });

  if (!concept) {
    return null;
  }

  const [lemmaLinks, endingLinks, phraseLinks, caseNode, relations] = await Promise.all([
    prisma.knowledgeLemmaConcept.findMany({
      where: { conceptId: concept.id },
      include: { lemma: true },
    }),
    prisma.knowledgeEndingConcept.findMany({
      where: { conceptId: concept.id },
      include: { ending: true },
    }),
    prisma.knowledgePhraseConcept.findMany({
      where: { conceptId: concept.id },
      include: { phrase: true },
    }),
    prisma.knowledgeCase.findUnique({
      where: { conceptId: concept.id },
      include: { concept: true },
    }),
    prisma.knowledgeConceptRelation.findMany({
      where: { fromConceptId: concept.id },
      include: { toConcept: true },
    }),
  ]);

  return {
    concept: mapConceptRow(concept),
    relatedConcepts: relations.map((r) => ({
      ...mapConceptRow(r.toConcept),
      relationType: r.relationType,
    })),
    lemmas: lemmaLinks.map((l) => mapLemmaRow(l.lemma)),
    endings: endingLinks.map((l) => mapEndingRow(l.ending)),
    phrases: phraseLinks.map((l) => mapPhraseRow(l.phrase)),
    cases: caseNode ? [mapCaseRow(caseNode, caseNode.concept)] : [],
    stats: {
      lemmaCount: lemmaLinks.length,
      endingCount: endingLinks.length,
      phraseCount: phraseLinks.length,
    },
  };
}
