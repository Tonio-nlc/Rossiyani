import { importQueue } from "@/services/bulk-import/import-queue";

export async function listImportJobs(limit = 20) {
  const jobs = await importQueue.listJobs(limit);

  return jobs.map((job) => ({
    id: job.id,
    name: job.name,
    status: job.status,
    totalFiles: job.totalFiles,
    processedFiles: job.processedFiles,
    failedFiles: job.failedFiles,
    skippedDuplicates: job.skippedDuplicates,
    sentencesProcessed: job.sentencesProcessed,
    knowledgeHits: job.knowledgeHits,
    aiCalls: job.aiCalls,
    createdAt: job.createdAt.toISOString(),
    completedAt: job.completedAt?.toISOString() ?? null,
    itemCount: job._count.items,
  }));
}

export type ImportJobSummary = Awaited<ReturnType<typeof listImportJobs>>[number];
