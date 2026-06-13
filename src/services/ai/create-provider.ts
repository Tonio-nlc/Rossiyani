import type { AIProvider, AIProviderId } from "./providers";
import { ClaudeProvider, OpenAIProvider } from "./providers";

/**
 * Resolves the configured AI provider implementation.
 * Implementation selection only — no analysis logic here.
 */
export function createAIProvider(providerId: AIProviderId): AIProvider {
  switch (providerId) {
    case "claude":
      return new ClaudeProvider();
    case "openai":
      return new OpenAIProvider();
    default: {
      const _exhaustive: never = providerId;
      return _exhaustive;
    }
  }
}

export function getAIProviderFromEnv(): AIProvider {
  const raw = process.env.AI_PROVIDER;
  if (raw !== "claude" && raw !== "openai") {
    throw new Error('AI_PROVIDER must be "claude" or "openai"');
  }
  return createAIProvider(raw);
}
