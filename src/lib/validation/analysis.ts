/**
 * Public validation API for analysis output.
 * Implementation lives in services/ai/schemas — re-exported for features and import.
 */

export {
  parseSentenceAnalysisOutput,
  safeParseSentenceAnalysisOutput,
  sentenceAnalysisOutputSchema,
} from "@/services/ai/schemas";

export type { SentenceAnalysisOutput } from "@/services/ai/schemas";
