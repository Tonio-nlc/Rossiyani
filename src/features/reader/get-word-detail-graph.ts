import { phraseLookupKey } from "@/lib/normalization/russian-key";
import { prisma } from "@/lib/prisma";
import type { WordDetailGraph, WordDetailSection } from "@/types/word-detail-graph";
import { WORD_DETAIL_SECTIONS } from "@/types/word-detail-graph";
import type { PhraseGroupType } from "@/types/domain";
import type { NeighborWordContext, PhraseOccurrenceContext } from "@/types/knowledge-workspace";

import { composeWordDetailGraph } from "./compose-word-detail-graph";

/**
 * Loads a word's complete domain graph from DB + KnowledgeGraph.
 * Never invokes AI. Used by GET /api/words/[id] and the Reader.
 */
export async function getWordDetailGraphFromDb(
  wordId: string,
  sections: WordDetailSection[] = WORD_DETAIL_SECTIONS,
): Promise<WordDetailGraph | null> {
  const word = await prisma.word.findUnique({
    where: { id: wordId },
    include: {
      sentence: {
        include: {
          words: { orderBy: { position: "asc" } },
          phraseGroups: true,
          text: { select: { id: true } },
        },
      },
      form: {
        include: {
          lemma: {
            include: { conceptLinks: { include: { concept: true } } },
          },
        },
      },
    },
  });

  if (!word) {
    return null;
  }

  const previousWord = resolvePreviousWord(word.sentence.words, word.position);
  const phraseOccurrence = resolvePhraseOccurrence(word.sentence.phraseGroups, word.position);

  let endingRow = null;
  if (word.ending) {
    endingRow = await prisma.knowledgeEnding.findFirst({
      where: { ending: word.ending, caseKey: word.case ?? "_" },
      include: { caseNode: true },
    });
  }

  let caseRow = endingRow?.caseNode ?? null;
  if (!caseRow && word.case) {
    caseRow = await prisma.knowledgeCase.findFirst({
      where: { caseKey: word.case },
    });
  }

  let phraseRow = null;
  if (phraseOccurrence?.label) {
    phraseRow = await prisma.knowledgePhrase.findUnique({
      where: { labelKey: phraseLookupKey(phraseOccurrence.label) },
    });
  }

  return composeWordDetailGraph({
    word,
    textId: word.sentence.text.id,
    previousWord,
    phraseOccurrence,
    endingRow,
    caseRow,
    phraseRow,
    sections,
  });
}

function resolvePreviousWord(
  words: Array<{ position: number; original: string; partOfSpeech: string }>,
  position: number,
): NeighborWordContext {
  if (position === 0) {
    return null;
  }
  const prev = words.find((w) => w.position === position - 1);
  return prev ? { original: prev.original, partOfSpeech: prev.partOfSpeech } : null;
}

function resolvePhraseOccurrence(
  phraseGroups: Array<{
    label: string;
    type: string;
    explanation: string;
    startPosition: number;
    endPosition: number;
  }>,
  position: number,
): PhraseOccurrenceContext {
  const group = phraseGroups.find(
    (g) => position >= g.startPosition && position <= g.endPosition,
  );
  if (!group) {
    return null;
  }
  return {
    label: group.label,
    type: group.type as PhraseGroupType,
    explanation: group.explanation,
  };
}
