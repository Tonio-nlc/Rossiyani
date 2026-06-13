import { knowledgeReviewService } from "@/services/knowledge-graph/admin/knowledge-review-service";

export async function getReviewCandidates(limit = 100) {
  return knowledgeReviewService.generateReviewCandidates(limit);
}
