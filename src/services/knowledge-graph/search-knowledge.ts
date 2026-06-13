import { prisma } from "@/lib/prisma";

export type KnowledgeSearchResult = {
  lemmas: Array<{ id: string; lemma: string; partOfSpeech: string; occurrenceCount: number }>;
  forms: Array<{ id: string; original: string; lemma: string; ending: string; case: string | null }>;
  endings: Array<{ id: string; ending: string; caseKey: string; hitCount: number }>;
  concepts: Array<{ id: string; conceptKey: string; title: string; category: string }>;
  phrases: Array<{ id: string; label: string; type: string; occurrenceCount: number }>;
  texts: Array<{ id: string; title: string; level: string; sentenceCount: number }>;
};

/**
 * Fast cross-entity search over existing Knowledge* and Text tables.
 */
export async function searchKnowledge(
  query: string,
  limit = 8,
): Promise<KnowledgeSearchResult> {
  const q = query.trim();
  if (q.length < 1) {
    return emptyResult();
  }

  const [lemmas, forms, endings, concepts, phrases, texts] = await Promise.all([
    prisma.knowledgeLemma.findMany({
      where: { lemma: { contains: q } },
      orderBy: { occurrenceCount: "desc" },
      take: limit,
      select: { id: true, lemma: true, partOfSpeech: true, occurrenceCount: true },
    }),
    prisma.knowledgeForm.findMany({
      where: { OR: [{ original: { contains: q } }, { ending: { contains: q } }] },
      orderBy: { occurrenceCount: "desc" },
      take: limit,
      select: {
        id: true,
        original: true,
        ending: true,
        case: true,
        lemma: { select: { lemma: true } },
      },
    }),
    prisma.knowledgeEnding.findMany({
      where: { ending: { contains: q } },
      orderBy: { hitCount: "desc" },
      take: limit,
      select: { id: true, ending: true, caseKey: true, hitCount: true },
    }),
    prisma.knowledgeConcept.findMany({
      where: {
        OR: [{ title: { contains: q } }, { conceptKey: { contains: q } }],
      },
      orderBy: { hitCount: "desc" },
      take: limit,
      select: { id: true, conceptKey: true, title: true, category: true },
    }),
    prisma.knowledgePhrase.findMany({
      where: { label: { contains: q } },
      orderBy: { occurrenceCount: "desc" },
      take: limit,
      select: { id: true, label: true, type: true, occurrenceCount: true },
    }),
    prisma.text.findMany({
      where: { title: { contains: q } },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { _count: { select: { sentences: true } } },
    }),
  ]);

  return {
    lemmas,
    forms: forms.map((f) => ({
      id: f.id,
      original: f.original,
      lemma: f.lemma.lemma,
      ending: f.ending,
      case: f.case,
    })),
    endings,
    concepts,
    phrases,
    texts: texts.map((t) => ({
      id: t.id,
      title: t.title,
      level: t.level,
      sentenceCount: t._count.sentences,
    })),
  };
}

function emptyResult(): KnowledgeSearchResult {
  return {
    lemmas: [],
    forms: [],
    endings: [],
    concepts: [],
    phrases: [],
    texts: [],
  };
}
