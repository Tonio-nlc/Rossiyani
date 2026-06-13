# features/import/

Orchestrates Russian content import for API and future admin UI.

## Responsibilities

- Resolve AI provider from configuration
- Delegate pipeline to `services/import`

## Allowed dependencies

- `@/services/ai`
- `@/services/import`
- `@/types`

## Must not

- Call Anthropic or OpenAI directly
- Contain parsing or Zod schema definitions
