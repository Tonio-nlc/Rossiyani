import { phraseLookupKey } from "@/lib/normalization/russian-key";
import { prisma } from "@/lib/prisma";
import type { PhraseGraph } from "@/types/knowledge-graph";

import {
  mapConceptRow,
  mapLemmaRow,
  mapPhraseOccurrenceRow,
  mapPhraseRow,
} from "./graph-mappers";

export async function getPhraseGraph(label: string): Promise<PhraseGraph | null> {
  const key = phraseLookupKey(label);
  const phraseRow = await prisma.knowledgePhrase.findUnique({
    where: { labelKey: key },
    include: {
      conceptLinks: { include: { concept: true } },
      phraseOccurrences: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!phraseRow) {
    return null;
  }

  const sentenceKeys = phraseRow.phraseOccurrences.map((o) => o.sentenceKey);
  const wordOccurrences = sentenceKeys.length
    ? await prisma.knowledgeOccurrence.findMany({
        where: { sentenceKey: { in: sentenceKeys } },
        include: { lemma: true },
        take: 100,
      })
    : [];

  const lemmaMap = new Map(wordOccurrences.map((o) => [o.lemma.id, o.lemma]));
  const distinctTexts = new Set(
    phraseRow.phraseOccurrences.map((o) => o.textId).filter((id): id is string => Boolean(id)),
  );

  return {
    phrase: mapPhraseRow(phraseRow),
    concepts: phraseRow.conceptLinks.map((l) => mapConceptRow(l.concept)),
    occurrences: phraseRow.phraseOccurrences.map(mapPhraseOccurrenceRow),
    exampleSentences: [...new Set(phraseRow.phraseOccurrences.map((o) => o.sentenceRussian))],
    relatedLemmas: [...lemmaMap.values()].map(mapLemmaRow),
    stats: {
      occurrenceCount: phraseRow.occurrenceCount,
      distinctTexts: distinctTexts.size,
    },
  };
}
