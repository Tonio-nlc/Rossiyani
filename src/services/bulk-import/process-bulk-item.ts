import type { ImportJobItem } from "@prisma/client";

import type { AIProvider } from "@/services/ai";
import { importRussianText } from "@/services/import";
import { createImportRunMetrics } from "@/types/import-pipeline";

import { readFile } from "node:fs/promises";

export type ProcessBulkItemResult = {
  status: "COMPLETED" | "SKIPPED_DUPLICATE" | "FAILED";
  textId?: string;
  errorMessage?: string;
  metrics: ReturnType<typeof createImportRunMetrics>;
};

/**
 * Processes a single ImportJobItem through the standard import pipeline.
 */
export async function processBulkItem(
  item: ImportJobItem,
  provider: AIProvider,
  options?: { delayBetweenSentencesMs?: number },
): Promise<ProcessBulkItemResult> {
  const metrics = createImportRunMetrics();

  try {
    let rawText: string;
    if (item.filePath) {
      rawText = await readFile(item.filePath, "utf8");
    } else {
      throw new Error("filePath manquant sur l'item de queue");
    }

    const result = await importRussianText(
      {
        title: item.title,
        level: item.level,
        source: item.source ?? undefined,
        rawText,
        contentHash: item.contentHash,
      },
      provider,
      {
        delayBetweenSentencesMs: options?.delayBetweenSentencesMs,
        metrics,
        skipDuplicates: true,
      },
    );

    if (result.skippedDuplicate) {
      return { status: "SKIPPED_DUPLICATE", textId: result.textId, metrics };
    }

    return { status: "COMPLETED", textId: result.textId, metrics };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    metrics.errors.push(message);
    return { status: "FAILED", errorMessage: message, metrics };
  }
}
