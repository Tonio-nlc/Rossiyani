export { KnowledgeGraphService, knowledgeGraphService } from "./knowledge-graph-service";
export { mergeOccurrence } from "./merge-occurrence";
export { linkSentenceToGraph } from "./link-sentence-to-graph";
export { getLemmaGraph } from "./get-lemma-graph";
export { getEndingGraph } from "./get-ending-graph";
export { getCaseGraph } from "./get-case-graph";
export { getPhraseGraph } from "./get-phrase-graph";
export { getConceptGraph } from "./get-concept-graph";
export {
  KnowledgeReviewService,
  knowledgeReviewService,
} from "./admin/knowledge-review-service";
export { MergeService, mergeService } from "./admin/merge-service";
export { generateReviewCandidates } from "./admin/review-candidates";
export type { ReviewCandidate } from "./admin/review-candidates";
export { searchKnowledge } from "./search-knowledge";
export type { KnowledgeSearchResult } from "./search-knowledge";
