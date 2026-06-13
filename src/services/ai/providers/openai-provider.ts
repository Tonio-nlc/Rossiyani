import { callOpenAIChat } from "../clients/openai-client";
import { requestSentenceAnalysis } from "../request-analysis";
import type { SentenceAnalysisInput, SentenceAnalysisOutput } from "../schemas";

import type { AIProvider } from "./ai-provider";

export class OpenAIProvider implements AIProvider {
  readonly id = "openai" as const;

  private readonly apiKey: string;
  private readonly model: string;

  constructor(options?: { apiKey?: string; model?: string }) {
    const apiKey = options?.apiKey ?? process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required for OpenAIProvider");
    }
    this.apiKey = apiKey;
    this.model = options?.model ?? process.env.OPENAI_MODEL ?? "gpt-4o";
  }

  analyzeSentence(input: SentenceAnalysisInput): Promise<SentenceAnalysisOutput> {
    return requestSentenceAnalysis(input, {
      apiKey: this.apiKey,
      model: this.model,
      providerLabel: "OpenAI",
      callModel: callOpenAIChat,
    });
  }
}
