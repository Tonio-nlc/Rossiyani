import { formLookupKey } from "@/lib/normalization/russian-key";
import { prisma } from "@/lib/prisma";

export type KnownLexiconSnapshot = {
  knownFormKeys: Set<string>;
  knownLemmaKeys: Set<string>;
  knownFormSurfaces: string[];
};

export async function loadKnownLexiconSnapshot(
  limit = 8000,
): Promise<KnownLexiconSnapshot> {
  const [forms, lemmas] = await Promise.all([
    prisma.knowledgeForm.findMany({
      select: { original: true, originalKey: true },
      orderBy: { hitCount: "desc" },
      take: limit,
    }),
    prisma.knowledgeLemma.findMany({
      select: { lemma: true },
      orderBy: { occurrenceCount: "desc" },
      take: limit,
    }),
  ]);

  const knownFormKeys = new Set(forms.map((row) => row.originalKey));
  const knownFormSurfaces = forms.map((row) => row.original);
  const knownLemmaKeys = new Set(
    lemmas.map((row) => row.lemma.toLocaleLowerCase("ru-RU")),
  );

  return { knownFormKeys, knownLemmaKeys, knownFormSurfaces };
}

export function isKnownFormSurface(surface: string, snapshot: KnownLexiconSnapshot): boolean {
  return snapshot.knownFormKeys.has(formLookupKey(surface));
}
