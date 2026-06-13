/** Mutable accumulator passed through import / bulk import pipelines. */
export type ImportRunMetrics = {
  sentencesProcessed: number;
  knowledgeHits: number;
  knowledgeMisses: number;
  aiCalls: number;
  errors: string[];
};

export function createImportRunMetrics(): ImportRunMetrics {
  return {
    sentencesProcessed: 0,
    knowledgeHits: 0,
    knowledgeMisses: 0,
    aiCalls: 0,
    errors: [],
  };
}

export type BulkImportProgress = {
  jobId: string;
  status: string;
  filesImported: number;
  filesFailed: number;
  skippedDuplicates: number;
  sentencesProcessed: number;
  knowledgeHits: number;
  knowledgeMisses: number;
  aiCalls: number;
  remainingFiles: number;
  totalFiles: number;
  errors: string[];
  startedAt: string | null;
  completedAt: string | null;
  estimatedSecondsRemaining: number | null;
};

export type BackfillReport = {
  textsProcessed: number;
  sentencesProcessed: number;
  wordsIndexed: number;
  occurrencesCreated: number;
  occurrencesSkipped: number;
  phraseOccurrencesCreated: number;
  conceptsLinked: number;
  phrasesIndexed: number;
  executionTimeMs: number;
  errors: string[];
};

export type KnowledgeMetricsSnapshot = {
  knowledgeCoveragePercent: number;
  averageAiCallsPerImport: number;
  knowledgeHits: number;
  knowledgeMisses: number;
  graphSize: {
    lemmas: number;
    forms: number;
    endings: number;
    phrases: number;
    concepts: number;
    occurrences: number;
    canonicalExplanations: number;
    reviewPending: number;
  };
  topLemmas: Array<{ lemma: string; occurrenceCount: number }>;
  topEndings: Array<{ ending: string; hitCount: number }>;
  topConcepts: Array<{ title: string; hitCount: number }>;
  topCollocations: Array<{ label: string; occurrenceCount: number }>;
  importJobs: {
    total: number;
    completed: number;
    failed: number;
  };
};
