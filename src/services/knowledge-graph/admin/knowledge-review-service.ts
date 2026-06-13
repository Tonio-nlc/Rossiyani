import type { KnowledgeReviewStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { generateReviewCandidates, type ReviewCandidate } from "./review-candidates";
import { mergeService, MergeService } from "./merge-service";

export type KnowledgeEntityType =
  | "lemma"
  | "form"
  | "ending"
  | "phrase"
  | "concept"
  | "case";

export type PromoteCanonicalInput = {
  entityType: KnowledgeEntityType;
  entityId: string;
  canonicalExplanation: string;
  frenchComparison?: string | null;
  reviewStatus?: KnowledgeReviewStatus;
};

export type RejectAnalysisInput = {
  entityType: KnowledgeEntityType;
  entityId: string;
  reason?: string;
};

/**
 * Admin Review Workspace boundaries (no UI).
 * Future: merge duplicates, promote canonical explanations, reject bad analyses.
 */
export class KnowledgeReviewService {
  async promoteCanonical(input: PromoteCanonicalInput): Promise<void> {
    const status = input.reviewStatus ?? "CANONICAL";

    switch (input.entityType) {
      case "lemma":
        await prisma.knowledgeLemma.update({
          where: { id: input.entityId },
          data: {
            canonicalExplanation: input.canonicalExplanation,
            frenchComparison: input.frenchComparison ?? undefined,
            reviewStatus: status,
          },
        });
        break;
      case "form":
        await prisma.knowledgeForm.update({
          where: { id: input.entityId },
          data: {
            canonicalExplanation: input.canonicalExplanation,
            reviewStatus: status,
          },
        });
        break;
      case "ending":
        await prisma.knowledgeEnding.update({
          where: { id: input.entityId },
          data: {
            canonicalExplanation: input.canonicalExplanation,
            reviewStatus: status,
          },
        });
        break;
      case "phrase":
        await prisma.knowledgePhrase.update({
          where: { id: input.entityId },
          data: {
            canonicalExplanation: input.canonicalExplanation,
            reviewStatus: status,
          },
        });
        break;
      case "concept":
        await prisma.knowledgeConcept.update({
          where: { id: input.entityId },
          data: {
            canonicalExplanation: input.canonicalExplanation,
            frenchComparison: input.frenchComparison ?? undefined,
            reviewStatus: status,
          },
        });
        break;
      case "case":
        await prisma.knowledgeCase.update({
          where: { id: input.entityId },
          data: {
            canonicalExplanation: input.canonicalExplanation,
            reviewStatus: status,
          },
        });
        break;
      default: {
        const _exhaustive: never = input.entityType;
        throw new Error(`Unsupported entity type: ${String(_exhaustive)}`);
      }
    }
  }

  async rejectAnalysis(input: RejectAnalysisInput): Promise<void> {
    const data = { reviewStatus: "REJECTED" as const };

    switch (input.entityType) {
      case "lemma":
        await prisma.knowledgeLemma.update({ where: { id: input.entityId }, data });
        break;
      case "form":
        await prisma.knowledgeForm.update({ where: { id: input.entityId }, data });
        break;
      case "ending":
        await prisma.knowledgeEnding.update({ where: { id: input.entityId }, data });
        break;
      case "phrase":
        await prisma.knowledgePhrase.update({ where: { id: input.entityId }, data });
        break;
      case "concept":
        await prisma.knowledgeConcept.update({ where: { id: input.entityId }, data });
        break;
      case "case":
        await prisma.knowledgeCase.update({ where: { id: input.entityId }, data });
        break;
      default: {
        const _exhaustive: never = input.entityType;
        throw new Error(`Unsupported entity type: ${String(_exhaustive)}`);
      }
    }
  }

  async listPendingReview(limit = 50) {
    const [lemmas, forms, phrases, concepts] = await Promise.all([
      prisma.knowledgeLemma.findMany({
        where: { reviewStatus: "PENDING" },
        orderBy: { occurrenceCount: "desc" },
        take: limit,
      }),
      prisma.knowledgeForm.findMany({
        where: { reviewStatus: "PENDING" },
        orderBy: { occurrenceCount: "desc" },
        take: limit,
      }),
      prisma.knowledgePhrase.findMany({
        where: { reviewStatus: "PENDING" },
        orderBy: { occurrenceCount: "desc" },
        take: limit,
      }),
      prisma.knowledgeConcept.findMany({
        where: { reviewStatus: "PENDING" },
        orderBy: { hitCount: "desc" },
        take: limit,
      }),
    ]);

    return { lemmas, forms, phrases, concepts };
  }

  async mergeDuplicateConcepts(
    keepConceptId: string,
    mergeConceptId: string,
  ): Promise<void> {
    await mergeService.mergeConcepts(keepConceptId, [mergeConceptId]);
  }

  async generateReviewCandidates(limit = 100): Promise<ReviewCandidate[]> {
    return generateReviewCandidates(limit);
  }

  get merge(): MergeService {
    return mergeService;
  }
}

export const knowledgeReviewService = new KnowledgeReviewService();
