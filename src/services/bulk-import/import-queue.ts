import type { CefrLevel, ImportJobItemStatus, ImportJobStatus } from "@prisma/client";

import { computeContentHash } from "@/lib/hash/content-hash";
import { prisma } from "@/lib/prisma";
import type { BulkImportProgress } from "@/types/import-pipeline";

import type { ImportFileDescriptor } from "./read-import-files";

export type EnqueueBulkImportInput = {
  name: string;
  files: ImportFileDescriptor[];
  level: CefrLevel;
  source?: string;
};

export class ImportQueue {
  async createJob(input: EnqueueBulkImportInput) {
    const items = input.files.map((file, index) => ({
      position: index,
      fileName: file.fileName,
      title: file.title,
      level: input.level,
      source: input.source ?? null,
      filePath: file.filePath,
      contentHash: computeContentHash(file.rawText),
    }));

    return prisma.importJob.create({
      data: {
        name: input.name,
        totalFiles: items.length,
        items: { create: items },
      },
      include: { items: { orderBy: { position: "asc" } } },
    });
  }

  async getJob(jobId: string) {
    return prisma.importJob.findUnique({
      where: { id: jobId },
      include: { items: { orderBy: { position: "asc" } } },
    });
  }

  async listJobs(limit = 20) {
    return prisma.importJob.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { _count: { select: { items: true } } },
    });
  }

  async updateJobStatus(jobId: string, status: ImportJobStatus) {
    return prisma.importJob.update({
      where: { id: jobId },
      data: {
        status,
        startedAt: status === "PROCESSING" ? new Date() : undefined,
        completedAt:
          status === "COMPLETED" || status === "FAILED" ? new Date() : undefined,
      },
    });
  }

  async claimNextPendingItem(jobId: string) {
    const item = await prisma.importJobItem.findFirst({
      where: { jobId, status: "PENDING" },
      orderBy: { position: "asc" },
    });
    if (!item) {
      return null;
    }

    return prisma.importJobItem.update({
      where: { id: item.id },
      data: { status: "PROCESSING" },
    });
  }

  async completeItem(
    itemId: string,
    status: ImportJobItemStatus,
    data: { textId?: string; errorMessage?: string },
  ) {
    return prisma.importJobItem.update({
      where: { id: itemId },
      data: { status, textId: data.textId ?? null, errorMessage: data.errorMessage ?? null },
    });
  }

  async syncJobCounters(jobId: string) {
    const [items, job] = await Promise.all([
      prisma.importJobItem.groupBy({
        by: ["status"],
        where: { jobId },
        _count: { status: true },
      }),
      prisma.importJob.findUnique({ where: { id: jobId } }),
    ]);

    if (!job) {
      return null;
    }

    const countByStatus = new Map(items.map((i) => [i.status, i._count.status]));
    const processed =
      (countByStatus.get("COMPLETED") ?? 0) + (countByStatus.get("SKIPPED_DUPLICATE") ?? 0);
    const failed = countByStatus.get("FAILED") ?? 0;
    const skipped = countByStatus.get("SKIPPED_DUPLICATE") ?? 0;

    const allDone = processed + failed === job.totalFiles;

    return prisma.importJob.update({
      where: { id: jobId },
      data: {
        processedFiles: processed,
        failedFiles: failed,
        skippedDuplicates: skipped,
        status: allDone ? (failed > 0 ? "FAILED" : "COMPLETED") : job.status,
        completedAt: allDone ? new Date() : null,
      },
    });
  }

  async incrementJobMetrics(
    jobId: string,
    delta: {
      sentencesProcessed?: number;
      knowledgeHits?: number;
      knowledgeMisses?: number;
      aiCalls?: number;
      error?: string;
    },
  ) {
    const job = await prisma.importJob.findUnique({ where: { id: jobId } });
    if (!job) {
      return;
    }

    const errors: string[] = job.errorsJson ? (JSON.parse(job.errorsJson) as string[]) : [];
    if (delta.error) {
      errors.push(delta.error);
    }

    await prisma.importJob.update({
      where: { id: jobId },
      data: {
        sentencesProcessed: { increment: delta.sentencesProcessed ?? 0 },
        knowledgeHits: { increment: delta.knowledgeHits ?? 0 },
        knowledgeMisses: { increment: delta.knowledgeMisses ?? 0 },
        aiCalls: { increment: delta.aiCalls ?? 0 },
        errorsJson: errors.length > 0 ? JSON.stringify(errors.slice(-500)) : undefined,
      },
    });
  }

  buildProgressReport(job: NonNullable<Awaited<ReturnType<ImportQueue["getJob"]>>>): BulkImportProgress {
    const remaining = job.totalFiles - job.processedFiles - job.failedFiles;
    const errors: string[] = job.errorsJson ? (JSON.parse(job.errorsJson) as string[]) : [];

    let estimatedSecondsRemaining: number | null = null;
    if (job.startedAt && remaining > 0 && job.processedFiles > 0) {
      const elapsedMs = Date.now() - job.startedAt.getTime();
      const msPerFile = elapsedMs / Math.max(job.processedFiles, 1);
      estimatedSecondsRemaining = Math.round((msPerFile * remaining) / 1000);
    }

    return {
      jobId: job.id,
      status: job.status,
      filesImported: job.processedFiles,
      filesFailed: job.failedFiles,
      skippedDuplicates: job.skippedDuplicates,
      sentencesProcessed: job.sentencesProcessed,
      knowledgeHits: job.knowledgeHits,
      knowledgeMisses: job.knowledgeMisses,
      aiCalls: job.aiCalls,
      remainingFiles: Math.max(remaining, 0),
      totalFiles: job.totalFiles,
      errors,
      startedAt: job.startedAt?.toISOString() ?? null,
      completedAt: job.completedAt?.toISOString() ?? null,
      estimatedSecondsRemaining,
    };
  }
}

export const importQueue = new ImportQueue();
