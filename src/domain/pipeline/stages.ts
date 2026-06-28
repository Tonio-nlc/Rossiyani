/** Ordered pipeline stages — AI is only invoked during the analysis stage. */
export type PipelineStage =
  | "segmentation"
  | "morphology"
  | "fixed-expressions"
  | "collocations"
  | "syntax"
  | "explanations"
  | "literal-translation"
  | "natural-translation"
  | "cultural-points"
  | "storage"
  | "knowledge-graph"
  | "pattern-index";

export const PIPELINE_STAGE_ORDER: PipelineStage[] = [
  "segmentation",
  "morphology",
  "fixed-expressions",
  "collocations",
  "syntax",
  "explanations",
  "literal-translation",
  "natural-translation",
  "cultural-points",
  "storage",
  "knowledge-graph",
  "pattern-index",
];

export type PipelineStageStatus = "pending" | "running" | "completed" | "skipped" | "failed";

export type PipelineStageResult<T> = {
  stage: PipelineStage;
  status: PipelineStageStatus;
  output: T;
  durationMs: number;
  usedAi: boolean;
};
