import { knowledgeGraphService } from "@/services/knowledge-graph";
import { pickCanonicalExplanation } from "@/services/knowledge-graph/graph-mappers";
import type { EndingKnowledge } from "@/types/knowledge-graph";

/**
 * Reader enrichment — ending + case knowledge from the KnowledgeGraph.
 */
export async function getEndingKnowledge(
  ending: string,
  grammaticalCase?: string | null,
): Promise<EndingKnowledge | null> {
  const graph = await knowledgeGraphService.getEndingGraph(ending, grammaticalCase);
  if (!graph) {
    return null;
  }

  return {
    ending: graph.ending.ending,
    caseKey: graph.ending.caseKey,
    canonicalExplanation: pickCanonicalExplanation(
      graph.ending.canonicalExplanation,
      graph.ending.explanationFr,
    ),
    hitCount: graph.ending.hitCount,
    concepts: graph.concepts,
    exampleForms: graph.forms,
  };
}
