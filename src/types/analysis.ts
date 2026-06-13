/**
 * Analysis types — inferred from Zod schemas in services/ai/schemas.
 * Re-exported here for use outside services/ai.
 */

export type {
  CulturalNoteOutput,
  PhraseGroupAnalysisOutput,
  SentenceAnalysisOutput,
  SyntaxAnalysisOutput,
  WordAnalysisOutput,
} from "@/services/ai/schemas/sentence-analysis.schema";

export type { SentenceAnalysisInput } from "@/services/ai/schemas/sentence-analysis.schema";
