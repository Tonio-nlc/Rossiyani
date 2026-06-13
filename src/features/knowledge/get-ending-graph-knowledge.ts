import { knowledgeGraphService } from "@/services/knowledge-graph";
import type { EndingGraph } from "@/types/knowledge-graph";

export async function getEndingGraphKnowledge(
  ending: string,
  grammaticalCase?: string | null,
): Promise<EndingGraph | null> {
  return knowledgeGraphService.getEndingGraph(ending, grammaticalCase);
}
