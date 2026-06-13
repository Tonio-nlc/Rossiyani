import { getPhraseKnowledge } from "@/features/knowledge/get-phrase-knowledge";
import { prisma } from "@/lib/prisma";
import {
  collocationPath,
  conceptPath,
  expressionPath,
  lemmaPath,
  textPath,
} from "@/components/explorer/explorer-routes";

export type StructureContext = {
  label: string;
  meaning: string | null;
  explanation: string | null;
  exampleSentence: string | null;
  readerHref: string | null;
  readerTitle: string | null;
  explorerHref: string;
};

export async function getStructureContext(label: string): Promise<StructureContext | null> {
  const trimmed = label.trim();
  if (!trimmed) {
    return null;
  }

  const phraseKnowledge = await getPhraseKnowledge(trimmed);
  if (phraseKnowledge) {
    const related = phraseKnowledge.relatedTexts[0];
    return {
      label: phraseKnowledge.label,
      meaning: phraseKnowledge.concepts[0]?.title ?? null,
      explanation: phraseKnowledge.canonicalExplanation,
      exampleSentence: phraseKnowledge.exampleSentences[0] ?? null,
      readerHref: related ? textPath(related.textId) : null,
      readerTitle: related?.textTitle ?? null,
      explorerHref:
        phraseKnowledge.type === "COLLOCATION"
          ? collocationPath(phraseKnowledge.label)
          : expressionPath(phraseKnowledge.label),
    };
  }

  const [lemma, concept] = await Promise.all([
    prisma.knowledgeLemma.findFirst({
      where: { lemma: trimmed },
      select: { lemma: true, partOfSpeech: true },
    }),
    prisma.knowledgeConcept.findFirst({
      where: {
        OR: [{ title: trimmed }, { title: { contains: trimmed } }],
      },
      select: { conceptKey: true, title: true, canonicalExplanation: true },
    }),
  ]);

  if (lemma) {
    return {
      label: lemma.lemma,
      meaning: null,
      explanation: null,
      exampleSentence: null,
      readerHref: null,
      readerTitle: null,
      explorerHref: lemmaPath(lemma.lemma, lemma.partOfSpeech),
    };
  }

  if (concept) {
    return {
      label: concept.title,
      meaning: concept.title,
      explanation: concept.canonicalExplanation,
      exampleSentence: null,
      readerHref: null,
      readerTitle: null,
      explorerHref: conceptPath(concept.conceptKey),
    };
  }

  return {
    label: trimmed,
    meaning: null,
    explanation: null,
    exampleSentence: null,
    readerHref: null,
    readerTitle: null,
    explorerHref: `/explorer?q=${encodeURIComponent(trimmed)}`,
  };
}
