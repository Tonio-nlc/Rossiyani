import type { ImportJobItem } from "@prisma/client";

import type { AIProvider } from "@/services/ai";
import type { CefrLevel } from "@/types/domain";
import type { BulkImportProgress } from "@/types/import-pipeline";

import { importQueue } from "./import-queue";
import { processBulkItem } from "./process-bulk-item";
import { readImportFolder } from "./read-import-files";

export type BulkImportOptions = {
  level: CefrLevel;
  source?: string;
  delayBetweenSentencesMs?: number;
  /** Max files processed in parallel (default 1 — respects AI rate limits). */
  concurrency?: number;
  recursive?: boolean;
};

/**
 * Industrial bulk import: folder → queue → parser → knowledge → persist → graph → report.
 */
export class BulkImportService {
  async enqueueFolder(jobName: string, folderPath: string, options: BulkImportOptions) {
    const files = await readImportFolder(folderPath, {
      level: options.level,
      source: options.source,
    }, options.recursive ?? false);

    if (files.length === 0) {
      throw new Error(`Aucun fichier texte trouvé dans ${folderPath}`);
    }

    return importQueue.createJob({
      name: jobName,
      files,
      level: options.level,
      source: options.source,
    });
  }

  async runJob(jobId: string, provider: AIProvider, options?: BulkImportOptions): Promise<BulkImportProgress> {
    await importQueue.updateJobStatus(jobId, "PROCESSING");

    const concurrency = Math.max(1, options?.concurrency ?? 1);

    while (true) {
      const batch: ImportJobItem[] = [];
      for (let i = 0; i < concurrency; i++) {
        const item = await importQueue.claimNextPendingItem(jobId);
        if (item) {
          batch.push(item);
        }
      }

      if (batch.length === 0) {
        break;
      }

      await Promise.all(
        batch.map(async (item) => {
          const result = await processBulkItem(item, provider, {
            delayBetweenSentencesMs: options?.delayBetweenSentencesMs,
          });

          await importQueue.completeItem(item.id, result.status, {
            textId: result.textId,
            errorMessage: result.errorMessage,
          });

          await importQueue.incrementJobMetrics(jobId, {
            sentencesProcessed: result.metrics.sentencesProcessed,
            knowledgeHits: result.metrics.knowledgeHits,
            knowledgeMisses: result.metrics.knowledgeMisses,
            aiCalls: result.metrics.aiCalls,
            error: result.errorMessage,
          });
        }),
      );

      await importQueue.syncJobCounters(jobId);
    }

    await importQueue.syncJobCounters(jobId);
    const job = await importQueue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} introuvable`);
    }

    return importQueue.buildProgressReport(job);
  }

  async getProgress(jobId: string): Promise<BulkImportProgress | null> {
    const job = await importQueue.getJob(jobId);
    if (!job) {
      return null;
    }
    return importQueue.buildProgressReport(job);
  }

  async resumeJob(jobId: string, provider: AIProvider, options?: BulkImportOptions) {
    const job = await importQueue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} introuvable`);
    }
    if (job.status === "COMPLETED") {
      return importQueue.buildProgressReport(job);
    }
    return this.runJob(jobId, provider, options);
  }
}

export const bulkImportService = new BulkImportService();
