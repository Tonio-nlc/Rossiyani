import type { PartOfSpeech } from "@prisma/client";

import { textPath } from "@/components/explorer/explorer-routes";
import { prisma } from "@/lib/prisma";
import { getPatternCatalogService } from "@/services/patterns";
import type { LearningPattern } from "@/types/patterns";
import type { LemmaKnowledge } from "@/types/knowledge-graph";
import type {
  VocabularyPatternEncounterExample,
  VocabularyPatternRef,
  VocabularyPatternSlice,
} from "@/types/vocabulary-pattern-experience";
import { buildReaderGuideCopy } from "@/lib/patterns/build-reader-guide-copy";
import type { ReaderPatternCanon } from "@/types/reader-pattern-experience";

function toCanon(pattern: LearningPattern): ReaderPatternCanon {
  return {
    id: pattern.id,
    userFacingName: pattern.userFacingName,
    observation: pattern.observation,
    insight: pattern.insight,
    comprehension: pattern.comprehension,
    guide: buildReaderGuideCopy(pattern),
  };
}

function conceptKeysFromKnowledge(knowledge: LemmaKnowledge): string[] {
  return [
    ...knowledge.concepts.map((concept) => concept.conceptKey),
    ...knowledge.relatedConcepts.map((concept) => concept.conceptKey),
  ];
}

function patternsFromConcepts(
  catalog: Awaited<ReturnType<typeof getPatternCatalogService>>,
  conceptKeys: string[],
): LearningPattern[] {
  if (conceptKeys.length === 0) {
    return [];
  }

  const keySet = new Set(conceptKeys);
  return catalog
    .getPatterns({ status: ["canonical", "draft"] })
    .filter((pattern) => pattern.knowledgeConceptKeys.some((key) => keySet.has(key)));
}

type PatternAccumulator = {
  pattern: LearningPattern;
  isPrimary: boolean;
  score: number;
  examples: VocabularyPatternEncounterExample[];
};

function upsertPattern(
  map: Map<string, PatternAccumulator>,
  pattern: LearningPattern,
  input: {
    isPrimary: boolean;
    scoreBoost: number;
    example?: VocabularyPatternEncounterExample;
  },
): void {
  const current = map.get(pattern.id);
  const score = (current?.score ?? 0) + input.scoreBoost;

  map.set(pattern.id, {
    pattern,
    isPrimary: (current?.isPrimary ?? false) || input.isPrimary,
    score,
    examples: input.example
      ? [...(current?.examples ?? []), input.example].slice(0, 4)
      : (current?.examples ?? []),
  });
}

async function loadInstancesForLemma(
  lemma: string,
  partOfSpeech: PartOfSpeech,
): Promise<
  Array<{
    patternId: string;
    isPrimary: boolean;
    detectionScore: number;
    sentence: {
      id: string;
      textId: string;
      russianText: string;
      naturalTranslation: string;
      primaryPatternId: string | null;
      text: { title: string } | null;
    };
  }>
> {
  return prisma.patternInstance.findMany({
    where: {
      sentence: {
        words: {
          some: { lemma, partOfSpeech },
        },
      },
    },
    select: {
      patternId: true,
      isPrimary: true,
      detectionScore: true,
      sentence: {
        select: {
          id: true,
          textId: true,
          russianText: true,
          naturalTranslation: true,
          primaryPatternId: true,
          text: { select: { title: true } },
        },
      },
    },
    orderBy: [{ isPrimary: "desc" }, { detectionScore: "desc" }],
    take: 24,
  });
}

function dedupeExamples(
  examples: VocabularyPatternEncounterExample[],
): VocabularyPatternEncounterExample[] {
  const seen = new Set<string>();
  const result: VocabularyPatternEncounterExample[] = [];

  for (const example of examples) {
    const key = `${example.sentenceId}:${example.russian}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(example);
  }

  return result.slice(0, 4);
}

function buildFallbackWhy(knowledge: LemmaKnowledge): string {
  if (knowledge.simpleExplanation?.trim()) {
    return knowledge.simpleExplanation.trim();
  }
  if (knowledge.frenchComparison?.trim()) {
    return knowledge.frenchComparison.trim();
  }
  if (knowledge.primaryTranslation?.trim()) {
    return `Ce mot structure une partie de ce que vous lisez en russe — pas seulement « ${knowledge.primaryTranslation} ».`;
  }
  return "Ce mot compte parce que vous l'avez rencontré en lisant — observez comment le russe s'en sert.";
}

/**
 * Resolves Learning Patterns linked to a saved word via instances + concept keys.
 */
export async function buildVocabularyPatternSlice(input: {
  lemma: string;
  partOfSpeech: PartOfSpeech;
  knowledge: LemmaKnowledge;
  sourceTextId: string;
}): Promise<VocabularyPatternSlice> {
  const catalog = await getPatternCatalogService();
  const accumulators = new Map<string, PatternAccumulator>();

  const instances = await loadInstancesForLemma(input.lemma, input.partOfSpeech);

  for (const instance of instances) {
    const pattern = catalog.getPattern(instance.patternId);
    if (!pattern) {
      continue;
    }

    const example: VocabularyPatternEncounterExample = {
      id: `${instance.sentence.id}:${instance.patternId}`,
      russian: instance.sentence.russianText,
      translation: instance.sentence.naturalTranslation || null,
      textId: instance.sentence.textId,
      textTitle: instance.sentence.text?.title ?? null,
      textHref: textPath(instance.sentence.textId),
      sentenceId: instance.sentence.id,
      audioCacheKey: `vocab-pattern:${instance.sentence.id}`,
    };

    upsertPattern(accumulators, pattern, {
      isPrimary:
        instance.isPrimary || instance.sentence.primaryPatternId === instance.patternId,
      scoreBoost: instance.isPrimary ? 3 : 1 + instance.detectionScore,
      example,
    });
  }

  for (const pattern of patternsFromConcepts(catalog, conceptKeysFromKnowledge(input.knowledge))) {
    upsertPattern(accumulators, pattern, {
      isPrimary: false,
      scoreBoost: 0.5,
    });
  }

  const ranked = [...accumulators.values()].sort((left, right) => {
    if (left.isPrimary !== right.isPrimary) {
      return left.isPrimary ? -1 : 1;
    }
    return right.score - left.score;
  });

  const patterns: VocabularyPatternRef[] = ranked.slice(0, 6).map((entry) => ({
    ...toCanon(entry.pattern),
    pedagogicalObjective: entry.pattern.pedagogicalObjective,
    formalization: entry.pattern.formalization.trim() || null,
    isPrimary: entry.isPrimary,
    encounteredExamples: dedupeExamples(entry.examples),
    relatedPatternIds: entry.pattern.relatedPatterns.map((relation) => relation.patternId),
  }));

  const primary =
    patterns.find((pattern) => pattern.isPrimary) ??
    patterns[0] ??
    null;

  const primaryPattern = primary ? catalog.getPattern(primary.id) : null;

  return {
    primaryPatternId: primary?.id ?? null,
    whyItMatters:
      primaryPattern?.pedagogicalObjective.trim() ||
      primaryPattern?.cognitiveSurprise.trim() ||
      buildFallbackWhy(input.knowledge),
    whatToNotice: primaryPattern?.observation.trim() || knowledgeObservationFallback(input.knowledge),
    patterns,
  };
}

function knowledgeObservationFallback(knowledge: LemmaKnowledge): string | null {
  if (knowledge.canonicalExplanation?.trim()) {
    return knowledge.canonicalExplanation.trim();
  }
  return null;
}
