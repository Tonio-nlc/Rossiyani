# services/knowledge-graph/

Canonical KnowledgeGraph over the LinguisticLibrary (`Knowledge*` tables).

## Responsibilities

| File | Role |
|------|------|
| `knowledge-graph-service.ts` | Facade |
| `merge-occurrence.ts` | Cumulative merge on import |
| `concept-resolver.ts` | Infer/link `KnowledgeConcept` nodes |
| `get-lemma-graph.ts` | Lemma-centric graph |
| `get-ending-graph.ts` | Ending-centric graph |
| `get-case-graph.ts` | Case-centric graph |
| `get-phrase-graph.ts` | Phrase-centric graph |
| `get-concept-graph.ts` | Concept-centric graph |
| `graph-mappers.ts` | DTO mapping |
| `admin/knowledge-review-service.ts` | Future Admin Review boundaries |

## Dependencies

- `@/lib/prisma`, `@/lib/normalization`, `@/lib/grammar`
- `@/types/knowledge-graph`
- Does **not** call `AIProvider`

## Import hook

`mergeOccurrence()` is called from `services/import/import-russian-text.ts` after `persistSentenceAnalysis`.
