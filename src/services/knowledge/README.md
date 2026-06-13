# services/knowledge/

KnowledgeLookupService — reads LinguisticLibrary **before** AIProvider.

## Flow position

```text
parser → KnowledgeLookupService → (miss) AIProvider → LinguisticLibraryIndexer
```

## Files

| File | Role |
|------|------|
| `knowledge-lookup-service.ts` | Lookup sentence, form, phrase, ending |
| `analyze-with-knowledge.ts` | Orchestration for import |

## Allowed dependencies

- `@/lib/prisma`
- `@/lib/normalization`
- `@/services/ai/schemas`
- `@/services/linguistic-library`
- `@/types`
