import { callAnthropicMessages } from "../clients/anthropic-client";
import { requestBatchSentenceAnalysis } from "../request-batch-analysis";
import { requestSentenceAnalysis } from "../request-analysis";
import type { SentenceAnalysisInput, SentenceAnalysisOutput } from "../schemas";

import type { AIProvider } from "./ai-provider";

export class ClaudeProvider implements AIProvider {
  readonly id = "claude" as const;

  private readonly apiKey: string;
  private readonly model: string;

  constructor(options?: { apiKey?: string; model?: string }) {
    const apiKey = options?.apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is required for ClaudeProvider");
    }
    this.apiKey = apiKey;
    this.model = options?.model ?? process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";
  }

  private analysisConfig() {
    return {
      apiKey: this.apiKey,
      model: this.model,
      providerLabel: "Claude",
      callModel: callAnthropicMessages,
    };
  }

  analyzeSentence(input: SentenceAnalysisInput): Promise<SentenceAnalysisOutput> {
    return requestSentenceAnalysis(input, this.analysisConfig());
  }

  async analyzeSentencesBatch(
    inputs: SentenceAnalysisInput[],
  ): Promise<SentenceAnalysisOutput[]> {
    const result = await requestBatchSentenceAnalysis(inputs, this.analysisConfig());
    return result.analyses;
  }
}
