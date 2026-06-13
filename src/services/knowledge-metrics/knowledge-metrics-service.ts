import { prisma } from "@/lib/prisma";
import type { KnowledgeMetricsSnapshot } from "@/types/import-pipeline";

/**
 * Internal quality & coverage metrics for development / admin.
 */
export class KnowledgeMetricsService {
  async getSnapshot(): Promise<KnowledgeMetricsSnapshot> {
    const [
      lemmaCount,
      formCount,
      endingCount,
      phraseCount,
      conceptCount,
      occurrenceCount,
      canonicalLemma,
      canonicalForm,
      canonicalConcept,
      reviewPendingLemma,
      reviewPendingForm,
      reviewPendingPhrase,
      reviewPendingConcept,
      importJobs,
      completedJobs,
      failedJobs,
      jobAiCalls,
      jobKnowledgeHits,
      jobKnowledgeMisses,
      topLemmas,
      topEndings,
      topConcepts,
      topCollocations,
    ] = await Promise.all([
      prisma.knowledgeLemma.count(),
      prisma.knowledgeForm.count(),
      prisma.knowledgeEnding.count(),
      prisma.knowledgePhrase.count(),
      prisma.knowledgeConcept.count(),
      prisma.knowledgeOccurrence.count(),
      prisma.knowledgeLemma.count({ where: { canonicalExplanation: { not: null } } }),
      prisma.knowledgeForm.count({ where: { canonicalExplanation: { not: null } } }),
      prisma.knowledgeConcept.count({ where: { reviewStatus: "CANONICAL" } }),
      prisma.knowledgeLemma.count({ where: { reviewStatus: "PENDING" } }),
      prisma.knowledgeForm.count({ where: { reviewStatus: "PENDING" } }),
      prisma.knowledgePhrase.count({ where: { reviewStatus: "PENDING" } }),
      prisma.knowledgeConcept.count({ where: { reviewStatus: "PENDING" } }),
      prisma.importJob.count(),
      prisma.importJob.count({ where: { status: "COMPLETED" } }),
      prisma.importJob.count({ where: { status: "FAILED" } }),
      prisma.importJob.aggregate({ _sum: { aiCalls: true } }),
      prisma.importJob.aggregate({ _sum: { knowledgeHits: true } }),
      prisma.importJob.aggregate({ _sum: { knowledgeMisses: true } }),
      prisma.knowledgeLemma.findMany({
        orderBy: { occurrenceCount: "desc" },
        take: 10,
        select: { lemma: true, occurrenceCount: true },
      }),
      prisma.knowledgeEnding.findMany({
        orderBy: { hitCount: "desc" },
        take: 10,
        select: { ending: true, hitCount: true },
      }),
      prisma.knowledgeConcept.findMany({
        orderBy: { hitCount: "desc" },
        take: 10,
        select: { title: true, hitCount: true },
      }),
      prisma.knowledgePhrase.findMany({
        orderBy: { occurrenceCount: "desc" },
        take: 10,
        select: { label: true, occurrenceCount: true },
      }),
    ]);

    const knowledgeHits = jobKnowledgeHits._sum.knowledgeHits ?? 0;
    const knowledgeMisses = jobKnowledgeMisses._sum.knowledgeMisses ?? 0;
    const totalLookups = knowledgeHits + knowledgeMisses;
    const knowledgeCoveragePercent =
      totalLookups > 0 ? Math.round((knowledgeHits / totalLookups) * 1000) / 10 : 0;

    const aiCalls = jobAiCalls._sum.aiCalls ?? 0;
    const averageAiCallsPerImport =
      completedJobs > 0 ? Math.round((aiCalls / completedJobs) * 10) / 10 : 0;

    const canonicalExplanations = canonicalLemma + canonicalForm + canonicalConcept;
    const reviewPending =
      reviewPendingLemma + reviewPendingForm + reviewPendingPhrase + reviewPendingConcept;

    return {
      knowledgeCoveragePercent,
      averageAiCallsPerImport,
      knowledgeHits,
      knowledgeMisses,
      graphSize: {
        lemmas: lemmaCount,
        forms: formCount,
        endings: endingCount,
        phrases: phraseCount,
        concepts: conceptCount,
        occurrences: occurrenceCount,
        canonicalExplanations,
        reviewPending,
      },
      topLemmas: topLemmas.map((l) => ({
        lemma: l.lemma,
        occurrenceCount: l.occurrenceCount,
      })),
      topEndings: topEndings.map((e) => ({
        ending: e.ending,
        hitCount: e.hitCount,
      })),
      topConcepts: topConcepts.map((c) => ({
        title: c.title,
        hitCount: c.hitCount,
      })),
      topCollocations: topCollocations.map((p) => ({
        label: p.label,
        occurrenceCount: p.occurrenceCount,
      })),
      importJobs: {
        total: importJobs,
        completed: completedJobs,
        failed: failedJobs,
      },
    };
  }
}

export const knowledgeMetricsService = new KnowledgeMetricsService();
