import type { CefrLevel } from "@/types/domain";
import type { ImportRunMetrics } from "@/types/import-pipeline";

export type ImportRussianTextInput = {
  title: string;
  level: CefrLevel;
  source?: string;
  rawText: string;
  /** Pre-computed hash; computed automatically when omitted. */
  contentHash?: string;
};

export type ImportRussianTextResult = {
  textId: string;
  sentenceCount: number;
  wordCount: number;
  phraseGroupCount: number;
  sentencesNeedingReview: number;
  warnings: string[];
  skippedDuplicate?: boolean;
  metrics?: ImportRunMetrics;
  qualityReport?: import("@/services/import-quality").ImportTextQualityReport;
  segmentStats?: import("@/domain/pipeline").ImportSegmentStats;
};

export type ImportPipelineOptions = {
  /** Delay between AI calls to reduce rate-limit risk (ms). */
  delayBetweenSentencesMs?: number;
  /** Mutable metrics accumulator for bulk import / reporting. */
  metrics?: ImportRunMetrics;
  /** Skip import when contentHash already exists in Text table. */
  skipDuplicates?: boolean;
};
