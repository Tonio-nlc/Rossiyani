# services/import/

Russian text import pipeline.

## Flow

```text
rawText
  → contentHash duplicate check
  → cleanText → segmentSentences
  → analyzeWithKnowledge (cache → AI)
  → persistSentenceAnalysis
  → knowledgeGraphService.mergeOccurrence
```

Bulk import: see `services/bulk-import/` and `docs/KNOWLEDGE_PIPELINE.md`.

## Files

| File | Role |
|------|------|
| `import-russian-text.ts` | Pipeline orchestration |
| `persist-sentence.ts` | Maps validated analysis → database |
| `types.ts` | Input/output types |

## Allowed dependencies

- `@/services/ai`, `@/services/knowledge`, `@/services/knowledge-graph`
- `@/services/parser`
- `@/lib/prisma`, `@/lib/hash`
- `@/types`
