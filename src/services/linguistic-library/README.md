# services/linguistic-library/

Writes validated analyses into Knowledge* tables.

## When

After Zod validation, via `indexFromAnalysis()`.

## Tables

- `KnowledgeLemma`
- `KnowledgeForm`
- `KnowledgeEnding`
- `KnowledgePhrase`
- `KnowledgeSentence`

See `docs/LINGUISTIC_LIBRARY.md`.

## Allowed dependencies

- `@/lib/prisma`
- `@/lib/normalization`
- `@/services/ai/schemas`
