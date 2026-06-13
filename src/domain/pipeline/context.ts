import type { PhraseGroupAnalysisOutput, SentenceAnalysisOutput, WordAnalysisOutput } from "@/types/analysis";
import type { ImportTranslationSummary } from "@/lib/diagnostics/import-translation-tracker";
import type { ImportTextQualityReport } from "@/services/import-quality";

import type { CulturalNote } from "./cultural-note";
import type { PipelineStage, PipelineStageResult } from "./stages";
import type { SyntaxAnalysis } from "./syntax-analysis";

/** Mutable context passed through all pipeline stages for one sentence. */
export type SentencePipelineContext = {
  textId: string;
  textTitle: string;
  position: number;
  rawRussianText: string;
  russianText: string;
  analysis: SentenceAnalysisOutput | null;
  morphology: WordAnalysisOutput[];
  fixedExpressions: PhraseGroupAnalysisOutput[];
  collocations: PhraseGroupAnalysisOutput[];
  syntaxAnalysis: SyntaxAnalysis | null;
  culturalNotes: CulturalNote[];
  sentenceId: string | null;
  formIdByPosition: Map<number, string>;
  phraseIdByLabel: Map<string, string>;
  stageResults: Partial<Record<PipelineStage, PipelineStageResult<unknown>>>;
  usedAi: boolean;
};

/** Result of processing a full text through the import pipeline. */
export type TextPipelineResult = {
  textId: string;
  sentenceCount: number;
  wordCount: number;
  phraseGroupCount: number;
  sentencesNeedingReview: number;
  warnings: string[];
  skippedDuplicate: boolean;
  aiCalls: number;
  knowledgeHits: number;
  knowledgeMisses: number;
  qualityReport?: ImportTextQualityReport;
  segmentStats?: ImportSegmentStats;
  translationSummary?: ImportTranslationSummary;
};

export type ImportSegmentStats = {
  total: number;
  complete: number;
  partial: number;
  failed: number;
  lost: number;
};

export type SegmentationOutput = {
  cleanedText: string;
  sentences: string[];
};

export type StorageOutput = {
  sentenceId: string;
  wordIds: Array<{ id: string; position: number; original: string; formId: string | null }>;
  phraseGroupCount: number;
};

export type KnowledgeGraphOutput = {
  occurrencesCreated: number;
  occurrencesSkipped: number;
  phraseOccurrencesCreated: number;
  conceptsLinked: number;
  lemmaPhraseLinks: number;
  conceptSentenceLinks: number;
  phraseSentenceLinks: number;
};
