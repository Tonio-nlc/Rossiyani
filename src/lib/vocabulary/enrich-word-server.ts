import { formatPosLabelFr } from "@/lib/explorer/lemma-display";
import { LEARNABLE_LEMMA_WHERE } from "@/lib/linguistics/lexical-metadata";
import { estimatedLevelFromLemma } from "@/lib/explorer/explorer-ia";
import { buildFrequencyVisual } from "@/lib/explorer/lemma-display";
import { formatDominantAspectFr } from "@/lib/explorer/lemma-display";
import { getLemmaKnowledge } from "@/features/knowledge/get-lemma-knowledge";
import { prisma } from "@/lib/prisma";
import type { PartOfSpeech } from "@prisma/client";
import type { LemmaKnowledge } from "@/types/knowledge-graph";

import { badgeToneForPos, createBadge } from "./card-utils";
import type { VocabularyBadge, VocabularyWordEnrichment } from "./types";

async function resolveLemmaKnowledge(
  lemma: string,
): Promise<{ knowledge: LemmaKnowledge; partOfSpeech: PartOfSpeech } | null> {
  const row = await prisma.knowledgeLemma.findFirst({
    where: { lemma, ...LEARNABLE_LEMMA_WHERE },
    orderBy: { occurrenceCount: "desc" },
    select: { lemma: true, partOfSpeech: true, isProperNoun: true },
  });

  if (!row) {
    return null;
  }

  const knowledge = await getLemmaKnowledge(row.lemma, row.partOfSpeech);
  if (!knowledge) {
    return null;
  }

  return { knowledge, partOfSpeech: row.partOfSpeech };
}

function buildBadgesFromKnowledge(knowledge: LemmaKnowledge): VocabularyBadge[] {
  const badges: VocabularyBadge[] = [];
  const posLabel = formatPosLabelFr(knowledge.partOfSpeech);
  const posTone = badgeToneForPos(posLabel);

  badges.push(createBadge(`pos-${knowledge.partOfSpeech}`, posLabel, posTone));

  const level = estimatedLevelFromLemma(knowledge);
  if (level) {
    badges.push(createBadge(`cefr-${level}`, level, "gold"));
  }

  const frequency = buildFrequencyVisual(
    knowledge.frequency,
    knowledge.frequencyTier,
    knowledge.occurrenceCount,
  );
  if (frequency && frequency.filledStars >= 4) {
    badges.push(createBadge("frequency", "Fréquent", "gold"));
  }

  const aspect = formatDominantAspectFr(knowledge.dominantAspect);
  if (aspect) {
    const tone = aspect.toLowerCase().includes("perfect") ? "violet" : "teal";
    badges.push(createBadge(`aspect-${aspect}`, aspect, tone));
  }

  for (const concept of knowledge.concepts.slice(0, 2)) {
    if (concept.title?.trim()) {
      badges.push(createBadge(`concept-${concept.id}`, concept.title, "blue"));
    }
  }

  return badges;
}

function pickExample(knowledge: LemmaKnowledge): {
  russian: string | null;
  translation: string | null;
} {
  const fromExamples = knowledge.examples[0];
  if (fromExamples?.sentenceRussian) {
    return {
      russian: fromExamples.sentenceRussian,
      translation: fromExamples.naturalTranslation ?? null,
    };
  }

  const sentence = knowledge.exampleSentences[0];
  if (sentence?.trim()) {
    return { russian: sentence.trim(), translation: null };
  }

  return { russian: null, translation: null };
}

export async function enrichWordForApi(input: {
  id: string;
  russian: string;
  headword: string | null;
}): Promise<VocabularyWordEnrichment> {
  const lookup = input.headword?.trim() || input.russian.trim();
  const resolved = await resolveLemmaKnowledge(lookup);

  if (!resolved) {
    return {
      id: input.id,
      translation: null,
      partOfSpeech: null,
      cefrLevel: null,
      stressMarked: null,
      textCount: 1,
      exampleRussian: null,
      exampleTranslation: null,
      badges: [],
    };
  }

  const { knowledge } = resolved;
  const example = pickExample(knowledge);

  return {
    id: input.id,
    translation: knowledge.primaryTranslation,
    partOfSpeech: formatPosLabelFr(knowledge.partOfSpeech),
    cefrLevel: estimatedLevelFromLemma(knowledge),
    stressMarked: knowledge.stressMarked,
    textCount: Math.max(knowledge.seenInTexts, 1),
    exampleRussian: example.russian,
    exampleTranslation: example.translation,
    badges: buildBadgesFromKnowledge(knowledge),
  };
}
