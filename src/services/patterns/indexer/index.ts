export { indexPatternInstances, PatternInstanceIndexer } from "./pattern-instance-indexer";
export { detectPatternsInSentence, defaultIntroductionLevel } from "./detect-patterns";
export { selectPrimaryPattern, type PrimarySelectionContext } from "./prioritize-primary";
export {
  extractConceptKeysFromAnalysis,
  mergeKnowledgeContext,
  findOccurrenceIdForSpan,
} from "./extract-knowledge-context";
export {
  persistPatternInstances,
  loadSentencePatternIndex,
} from "./persist-pattern-instances";
export { resolveIndexerKnowledgeContext } from "./resolve-indexer-knowledge-context";

export type {
  PatternInstance,
  SentencePatternIndex,
  PatternIndexerInput,
  PatternIndexerKnowledgeContext,
  PatternDetectionEvidence,
  PrimarySelectionReason,
  PatternIndexPersistResult,
} from "@/types/pattern-instances";
