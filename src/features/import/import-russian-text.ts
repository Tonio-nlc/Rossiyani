import { getAIProviderFromEnv } from "@/services/ai";
import {
  importRussianText,
  type ImportPipelineOptions,
  type ImportRussianTextInput,
  type ImportRussianTextResult,
} from "@/services/import";

/**
 * Domain entry point for the Russian text import pipeline.
 * Selects AI provider from environment — no vendor logic here.
 */
export async function importRussianTextFeature(
  input: ImportRussianTextInput,
  options?: ImportPipelineOptions,
): Promise<ImportRussianTextResult> {
  const provider = getAIProviderFromEnv();
  return importRussianText(input, provider, options);
}
