import { lemmaPath } from "@/components/explorer/explorer-routes";
import { prisma } from "@/lib/prisma";
import type { ComposeVocabularyLink } from "@/lib/compose/types";

export type KnownReaderWord = {
  word: string;
  lemma: string | null;
  savedWordId: string;
  textId: string;
};

function tokenizeRussian(text: string): string[] {
  return text
    .split(/\s+/)
    .map((token) => token.replace(/[.,!?«»"()—–-]/g, "").trim())
    .filter((token) => token.length > 2);
}

export async function enrichVocabularyLinks(input: {
  russianText: string;
  knownWords?: KnownReaderWord[];
}): Promise<ComposeVocabularyLink[]> {
  const tokens = [...new Set(tokenizeRussian(input.russianText))].slice(0, 12);
  const knownByLemma = new Map<string, KnownReaderWord>();
  const knownByForm = new Map<string, KnownReaderWord>();

  for (const word of input.knownWords ?? []) {
    if (word.lemma) {
      knownByLemma.set(word.lemma.toLowerCase(), word);
    }
    knownByForm.set(word.word.toLowerCase(), word);
  }

  const links: ComposeVocabularyLink[] = [];
  const seen = new Set<string>();

  for (const token of tokens) {
    const key = token.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    const known =
      knownByForm.get(key) ??
      knownByLemma.get(key) ??
      [...knownByLemma.values()].find(
        (entry) => entry.lemma?.toLowerCase() === key || entry.word.toLowerCase() === key,
      );

    if (known) {
      links.push({
        word: token,
        label: known.lemma ?? known.word,
        href: `/vocabulary/words/${known.savedWordId}`,
        encountered: true,
        savedWordId: known.savedWordId,
      });
      continue;
    }

    const lemma = await prisma.knowledgeLemma.findFirst({
      where: {
        OR: [{ lemma: token }, { lemma: { equals: token, mode: "insensitive" } }],
      },
      select: { lemma: true, partOfSpeech: true },
    });

    links.push({
      word: token,
      label: lemma?.lemma ?? token,
      href: lemma ? lemmaPath(lemma.lemma, lemma.partOfSpeech) : null,
      encountered: false,
      savedWordId: null,
    });
  }

  return links.slice(0, 8);
}
