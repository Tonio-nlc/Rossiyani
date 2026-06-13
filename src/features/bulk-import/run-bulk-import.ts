import { getAIProviderFromEnv } from "@/services/ai";
import { bulkImportService } from "@/services/bulk-import";
import type { CefrLevel } from "@/types/domain";
import type { BulkImportProgress } from "@/types/import-pipeline";

export type RunBulkImportInput = {
  jobName: string;
  folderPath: string;
  level: CefrLevel;
  source?: string;
  delayBetweenSentencesMs?: number;
  concurrency?: number;
  recursive?: boolean;
};

export async function enqueueBulkImport(input: RunBulkImportInput) {
  return bulkImportService.enqueueFolder(input.jobName, input.folderPath, {
    level: input.level,
    source: input.source,
    delayBetweenSentencesMs: input.delayBetweenSentencesMs,
    concurrency: input.concurrency,
    recursive: input.recursive,
  });
}

export async function runBulkImportJob(
  jobId: string,
  options?: Omit<RunBulkImportInput, "jobName" | "folderPath" | "level"> & { level?: CefrLevel },
): Promise<BulkImportProgress> {
  const provider = getAIProviderFromEnv();
  return bulkImportService.runJob(jobId, provider, {
    level: options?.level ?? "B1",
    source: options?.source,
    delayBetweenSentencesMs: options?.delayBetweenSentencesMs,
    concurrency: options?.concurrency,
  });
}

export async function getBulkImportProgress(jobId: string) {
  return bulkImportService.getProgress(jobId);
}

export async function resumeBulkImportJob(jobId: string) {
  const provider = getAIProviderFromEnv();
  return bulkImportService.resumeJob(jobId, provider);
}
