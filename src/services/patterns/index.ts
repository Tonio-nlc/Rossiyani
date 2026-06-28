export { PatternCatalogService, getPatternCatalogService, resetPatternCatalogCache } from "./pattern-catalog-service";
export { loadCatalogFromData, loadCatalogFromDirectory, DEFAULT_CATALOG_ROOT } from "./load-catalog";
export {
  validateCatalog,
  validatePattern,
  assertValidCatalog,
  type ValidateCatalogOptions,
} from "./validate-catalog";
export {
  learningPatternSchema,
  patternCatalogDataSchema,
  patternFamilySchema,
  patternPathSchema,
} from "./schemas";

export {
  indexPatternInstances,
  PatternInstanceIndexer,
  persistPatternInstances,
  loadSentencePatternIndex,
  resolveIndexerKnowledgeContext,
  selectPrimaryPattern,
  extractConceptKeysFromAnalysis,
} from "./indexer";

export type {
  PatternInstance,
  SentencePatternIndex,
  PatternIndexerInput,
  PatternIndexerKnowledgeContext,
  PatternDetectionEvidence,
  PrimarySelectionReason,
  PatternIndexPersistResult,
} from "@/types/pattern-instances";

export type {
  LearningPattern,
  PatternCatalogData,
  PatternFamily,
  PatternPath,
  PatternPathStep,
  PatternSearchOptions,
  PatternValidationResult,
  RelatedPatternResult,
} from "@/types/patterns";
