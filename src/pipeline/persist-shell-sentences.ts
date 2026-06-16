import { buildMinimalAnalysis } from "@/services/ai/build-minimal-analysis";
import { prisma } from "@/lib/prisma";

export type ShellSegment = {
  sentenceIndex: number;
  rawRussianText: string;
  sanitizedText: string;
  storagePosition: number;
};

export async function persistShellSentences(
  textId: string,
  segments: ShellSegment[],
): Promise<void> {
  if (segments.length === 0) {
    return;
  }

  await prisma.sentence.createMany({
    data: segments.map((segment) => {
      const minimal = buildMinimalAnalysis({
        russianText: segment.sanitizedText,
        status: "partial",
        reason: "Analyse en cours.",
      });

      return {
        textId,
        position: segment.storagePosition,
        russianText: segment.sanitizedText,
        literalTranslation: minimal.literalTranslation,
        naturalTranslation: minimal.naturalTranslation,
        russianLogic: minimal.russianLogic,
        orderExplanation: minimal.orderExplanation,
        nativeUsageNotes: minimal.nativeUsageNotes,
        register: minimal.register,
        difficultyScore: minimal.difficultyScore,
        needsReview: true,
        reviewMessage: minimal.reviewMessage ?? null,
        analysisState: "PENDING" as const,
        analysisJson: JSON.stringify({ ...minimal, analysisStatus: "pending" }),
      };
    }),
  });
}

export function countWordsInSegments(segments: ShellSegment[]): number {
  return segments.reduce(
    (total, segment) => total + segment.sanitizedText.split(/\s+/).filter(Boolean).length,
    0,
  );
}
