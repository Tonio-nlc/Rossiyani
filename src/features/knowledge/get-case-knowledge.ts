import { knowledgeGraphService } from "@/services/knowledge-graph";
import type { CaseGraph } from "@/types/knowledge-graph";

export async function getCaseKnowledge(caseKey: string): Promise<CaseGraph | null> {
  return knowledgeGraphService.getCaseGraph(caseKey);
}
