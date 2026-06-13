import { runTextImportPipeline } from "@/pipeline";
import type { AIProvider } from "@/services/ai";

import type {
  ImportPipelineOptions,
  ImportRussianTextInput,
  ImportRussianTextResult,
} from "./types";

/**
 * Import pipeline entry point — delegates to runTextImportPipeline.
 * @deprecated Use runTextImportPipeline from @/pipeline directly.
 */
export async function importRussianText(
  input: ImportRussianTextInput,
  provider: AIProvider,
  options?: ImportPipelineOptions,
): Promise<ImportRussianTextResult> {
  const result = await runTextImportPipeline(input, provider, options);

  return {
    textId: result.textId,
    sentenceCount: result.sentenceCount,
    wordCount: result.wordCount,
    phraseGroupCount: result.phraseGroupCount,
    sentencesNeedingReview: result.sentencesNeedingReview,
    warnings: result.warnings,
    skippedDuplicate: result.skippedDuplicate,
    metrics: options?.metrics,
    qualityReport: result.qualityReport,
    segmentStats: result.segmentStats,
  };
}
