import type { SentenceAnalysisInput, SentenceAnalysisOutput } from "../schemas";

/**
 * Provider-agnostic contract for the linguistic analysis engine.
 * All application code must depend on this interface only.
 */
export interface AIProvider {
  readonly id: "claude" | "openai";

  analyzeSentence(input: SentenceAnalysisInput): Promise<SentenceAnalysisOutput>;

  /** Analyze multiple sentences in one request when possible. */
  analyzeSentencesBatch(inputs: SentenceAnalysisInput[]): Promise<SentenceAnalysisOutput[]>;
}

export type AIProviderId = AIProvider["id"];
