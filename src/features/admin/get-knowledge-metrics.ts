import { knowledgeMetricsService } from "@/services/knowledge-metrics";

export async function getKnowledgeMetrics() {
  return knowledgeMetricsService.getSnapshot();
}
