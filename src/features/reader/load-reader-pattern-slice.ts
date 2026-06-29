import { prisma } from "@/lib/prisma";
import { buildReaderGuideCopy } from "@/lib/patterns/build-reader-guide-copy";
import { getPatternCatalogService } from "@/services/patterns";
import type {
  ReaderPatternCanon,
  ReaderPatternSlice,
  ReaderSentencePatternContext,
} from "@/types/reader-pattern-experience";
import type { LearningPattern } from "@/types/patterns";

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

/**
 * Loads pattern slice data for a text (catalog + instances per sentence).
 * Server-only — no IA.
 */
export async function loadReaderPatternSlice(textId: string): Promise<ReaderPatternSlice> {
  const [catalog, sentences] = await Promise.all([
    getPatternCatalogService(),
    prisma.sentence.findMany({
      where: { textId },
      select: {
        id: true,
        primaryPatternId: true,
        patternInstances: {
          select: {
            patternId: true,
            startPosition: true,
            endPosition: true,
            salience: true,
            confidence: true,
            triggeringTokensJson: true,
            isPrimary: true,
          },
        },
      },
      orderBy: { position: "asc" },
    }),
  ]);

  const patterns: Record<string, ReaderPatternCanon> = {};
  const bySentenceId: Record<string, ReaderSentencePatternContext> = {};

  for (const sentence of sentences) {
    const primaryRow =
      sentence.patternInstances.find((row) => row.isPrimary) ??
      sentence.patternInstances.find((row) => row.patternId === sentence.primaryPatternId) ??
      null;

    const secondaryPatternIds = sentence.patternInstances
      .filter((row) => row.patternId !== primaryRow?.patternId)
      .map((row) => row.patternId);

    const instance = primaryRow
      ? {
          span: {
            startPosition: primaryRow.startPosition,
            endPosition: primaryRow.endPosition,
          },
          triggeringTokens: JSON.parse(primaryRow.triggeringTokensJson) as number[],
          salience: primaryRow.salience,
          confidence: primaryRow.confidence,
        }
      : null;

    const primaryPatternId = sentence.primaryPatternId ?? primaryRow?.patternId ?? null;

    if (primaryPatternId) {
      const pattern = catalog.getPattern(primaryPatternId);
      if (pattern && !patterns[primaryPatternId]) {
        patterns[primaryPatternId] = toCanon(pattern);
      }
    }

    bySentenceId[sentence.id] = {
      primaryPatternId,
      instance,
      secondaryPatternIds,
    };
  }

  return { patterns, bySentenceId };
}
