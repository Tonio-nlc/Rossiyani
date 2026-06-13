import { knowledgeGraphService } from "@/services/knowledge-graph";
import type { ConceptKnowledge } from "@/types/knowledge-graph";

/**
 * Reader enrichment — pedagogical concept from the KnowledgeGraph.
 */
export async function getConceptKnowledge(
  conceptKeyOrTitle: string,
): Promise<ConceptKnowledge | null> {
  return knowledgeGraphService.getConceptGraph(conceptKeyOrTitle);
}
