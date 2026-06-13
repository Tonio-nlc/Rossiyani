import { searchKnowledge } from "@/services/knowledge-graph";
import type { KnowledgeSearchResult } from "@/services/knowledge-graph/search-knowledge";

export async function universalSearch(query: string, limit = 8): Promise<KnowledgeSearchResult> {
  return searchKnowledge(query, limit);
}

export type { KnowledgeSearchResult };
