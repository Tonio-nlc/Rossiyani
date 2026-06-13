# services/ai/

Linguistic analysis engine integration.

## Design

All analysis goes through the `AIProvider` interface in `providers/ai-provider.ts`.

Implementations:

- `ClaudeProvider`
- `OpenAIProvider`

Selection via `AI_PROVIDER` environment variable and `create-provider.ts`.

## Must not

- Leak provider-specific types outside this folder
- Be imported directly by UI components

## Allowed dependencies

- `@/types/analysis`
