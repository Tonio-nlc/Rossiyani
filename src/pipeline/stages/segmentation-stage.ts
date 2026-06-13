import { cleanText, segmentSentences } from "@/services/parser";
import {
  auditPipelineStepSync,
  auditPreviewText,
} from "@/lib/diagnostics/import-pipeline-audit";
import type { SegmentationOutput } from "@/domain/pipeline";

/**
 * Stage 1 — Segmentation: clean raw text and split into sentences.
 * No AI.
 */
export function runSegmentationStage(rawText: string): SegmentationOutput {
  const cleanedText = auditPipelineStepSync(
    "cleanText",
    "segmentation-stage.ts:13",
    {
      rawTextLength: rawText.length,
      preview: auditPreviewText(rawText),
    },
    () => cleanText(rawText),
    (result) => ({
      cleanedLength: result.length,
      preview: auditPreviewText(result),
    }),
  );

  const sentences = auditPipelineStepSync(
    "segmentSentences",
    "segmentation-stage.ts:27",
    {
      cleanedLength: cleanedText.length,
      preview: auditPreviewText(cleanedText),
    },
    () => segmentSentences(cleanedText),
    (result) => ({
      sentenceCount: result.length,
      previews: result.map((sentence) => auditPreviewText(sentence, 80)),
    }),
  );

  return { cleanedText, sentences };
}
