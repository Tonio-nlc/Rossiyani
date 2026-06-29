import type { PatternIndexerInput, PatternInstance, SentencePatternIndex } from "@/types/pattern-instances";

import { resolveEditorialPrimaryPatternId } from "@/lib/reader/foundation-pack-path";
import { detectPatternsInSentence, defaultIntroductionLevel } from "./detect-patterns";
import { mergeKnowledgeContext, findOccurrenceIdForSpan } from "./extract-knowledge-context";
import { selectPrimaryPattern } from "./prioritize-primary";

function resolveEditorialIntroPatternIds(
  catalog: PatternIndexerInput["catalog"],
  textId: string,
): string[] {
  return catalog
    .getPatterns({ status: "canonical" })
    .filter((pattern) => pattern.introductionConditions.editorialTextIds?.includes(textId))
    .map((pattern) => pattern.id);
}

function toPatternInstance(
  candidate: ReturnType<typeof detectPatternsInSentence>[number],
  input: PatternIndexerInput,
  knowledgeContext: ReturnType<typeof mergeKnowledgeContext>,
  isPrimary: boolean,
  detectedAt: string,
): PatternInstance {
  const pattern = input.catalog.getPattern(candidate.patternId);
  const occurrenceId = findOccurrenceIdForSpan(knowledgeContext, candidate.span);

  return {
    patternId: candidate.patternId,
    sentenceId: input.sentenceId,
    textId: input.textId,
    span: candidate.span,
    salience: candidate.salience,
    confidence: candidate.confidence,
    detectionScore: candidate.detectionScore,
    evidence: candidate.evidence,
    triggeringTokens: candidate.triggeringTokens,
    introductionLevel: pattern ? defaultIntroductionLevel(pattern) : "L2",
    isPrimary,
    occurrenceId,
    detectedAt,
  };
}

/**
 * Indexes Learning Pattern instances for a single analyzed sentence.
 * Reuses existing linguistic analysis and optional Knowledge Graph context.
 */
export function indexPatternInstances(input: PatternIndexerInput): SentencePatternIndex {
  const detectedAt = input.detectedAt ?? new Date().toISOString();
  const knowledgeContext = mergeKnowledgeContext(input.analysis, input.knowledgeContext);
  const patterns = input.catalog.getPatterns({ status: ["canonical", "draft"] });

  const candidates = detectPatternsInSentence(patterns, {
    analysis: input.analysis,
    conceptKeys: knowledgeContext.conceptKeys,
  });

  const { primary, reasons } = selectPrimaryPattern(candidates, input.catalog, {
    textId: input.textId,
    editorialIntroPatternIds: resolveEditorialIntroPatternIds(input.catalog, input.textId),
    editorialPrimaryPatternId: resolveEditorialPrimaryPatternId(
      input.textId,
      input.sentencePosition,
    ),
  });

  const primaryId = primary?.patternId ?? null;
  const instances = candidates.map((candidate) =>
    toPatternInstance(
      candidate,
      input,
      knowledgeContext,
      candidate.patternId === primaryId,
      detectedAt,
    ),
  );

  const secondaryPatternIds = instances
    .filter((instance) => !instance.isPrimary)
    .map((instance) => instance.patternId);

  return {
    sentenceId: input.sentenceId,
    textId: input.textId,
    instances,
    primaryPatternId: primaryId,
    secondaryPatternIds,
    indexedAt: detectedAt,
    primarySelectionReasons: reasons,
  };
}

export class PatternInstanceIndexer {
  constructor(private readonly catalog: PatternIndexerInput["catalog"]) {}

  index(input: Omit<PatternIndexerInput, "catalog">): SentencePatternIndex {
    return indexPatternInstances({ ...input, catalog: this.catalog });
  }
}
