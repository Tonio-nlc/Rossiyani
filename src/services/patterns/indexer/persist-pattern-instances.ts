import { prisma } from "@/lib/prisma";
import type { PatternIndexPersistResult, SentencePatternIndex } from "@/types/pattern-instances";

function serializeJson(value: unknown): string {
  return JSON.stringify(value);
}

/**
 * Persists a SentencePatternIndex to the database.
 * Idempotent per (sentenceId, patternId) — safe to re-run on re-import.
 */
export async function persistPatternInstances(
  index: SentencePatternIndex,
): Promise<PatternIndexPersistResult> {
  const existing = await prisma.patternInstance.findMany({
    where: { sentenceId: index.sentenceId },
    select: { id: true, patternId: true },
  });

  const existingByPatternId = new Map(existing.map((row) => [row.patternId, row.id]));
  const incomingPatternIds = new Set(index.instances.map((instance) => instance.patternId));

  let instancesCreated = 0;
  let instancesUpdated = 0;

  for (const instance of index.instances) {
    const data = {
      patternId: instance.patternId,
      sentenceId: instance.sentenceId,
      textId: instance.textId,
      startPosition: instance.span.startPosition,
      endPosition: instance.span.endPosition,
      salience: instance.salience,
      confidence: instance.confidence,
      detectionScore: instance.detectionScore,
      isPrimary: instance.isPrimary,
      introductionLevel: instance.introductionLevel,
      evidenceJson: serializeJson(instance.evidence),
      triggeringTokensJson: serializeJson(instance.triggeringTokens),
      occurrenceId: instance.occurrenceId ?? null,
      phraseOccurrenceId: instance.phraseOccurrenceId ?? null,
      detectedAt: new Date(instance.detectedAt),
    };

    const existingId = existingByPatternId.get(instance.patternId);
    if (existingId) {
      await prisma.patternInstance.update({
        where: { id: existingId },
        data,
      });
      instancesUpdated += 1;
    } else {
      await prisma.patternInstance.create({ data });
      instancesCreated += 1;
    }
  }

  const toRemove = existing.filter((row) => !incomingPatternIds.has(row.patternId));
  if (toRemove.length > 0) {
    await prisma.patternInstance.deleteMany({
      where: { id: { in: toRemove.map((row) => row.id) } },
    });
  }

  await prisma.sentence.update({
    where: { id: index.sentenceId },
    data: {
      primaryPatternId: index.primaryPatternId,
      patternIndexedAt: new Date(index.indexedAt),
    },
  });

  return {
    instancesCreated,
    instancesUpdated,
    instancesRemoved: toRemove.length,
  };
}

/**
 * Loads persisted pattern instances for a sentence.
 */
export async function loadSentencePatternIndex(
  sentenceId: string,
): Promise<SentencePatternIndex | null> {
  const sentence = await prisma.sentence.findUnique({
    where: { id: sentenceId },
    select: {
      id: true,
      textId: true,
      primaryPatternId: true,
      patternIndexedAt: true,
      patternInstances: true,
    },
  });

  if (!sentence || sentence.patternInstances.length === 0) {
    return null;
  }

  const instances = sentence.patternInstances.map((row) => ({
    id: row.id,
    patternId: row.patternId,
    sentenceId: row.sentenceId,
    textId: row.textId ?? sentence.textId,
    span: {
      startPosition: row.startPosition,
      endPosition: row.endPosition,
    },
    salience: row.salience,
    confidence: row.confidence,
    detectionScore: row.detectionScore,
    evidence: JSON.parse(row.evidenceJson) as SentencePatternIndex["instances"][number]["evidence"],
    triggeringTokens: JSON.parse(row.triggeringTokensJson) as number[],
    introductionLevel: row.introductionLevel as SentencePatternIndex["instances"][number]["introductionLevel"],
    isPrimary: row.isPrimary,
    occurrenceId: row.occurrenceId,
    phraseOccurrenceId: row.phraseOccurrenceId,
    detectedAt: row.detectedAt.toISOString(),
  }));

  return {
    sentenceId: sentence.id,
    textId: sentence.textId,
    instances,
    primaryPatternId: sentence.primaryPatternId,
    secondaryPatternIds: instances.filter((instance) => !instance.isPrimary).map((i) => i.patternId),
    indexedAt: (sentence.patternIndexedAt ?? sentence.patternInstances[0]!.detectedAt).toISOString(),
    primarySelectionReasons: [],
  };
}
