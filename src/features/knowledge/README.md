# features/knowledge/

Domain entry for LinguisticLibrary and KnowledgeGraph.

## Responsibilities

- Import: re-export `analyzeWithKnowledge`
- Reader enrichment:
  - `getLemmaKnowledge()`
  - `getEndingKnowledge()`
  - `getConceptKnowledge()`
  - `getPhraseKnowledge()`
  - `getWordKnowledgeWorkspace()` — compose les 4 services pour le Reader 2.0

## Allowed dependencies

- `@/services/knowledge`
- `@/services/knowledge-graph`
- `@/services/linguistic-library`

## Must not

- Call AI providers directly
- Contain Prisma queries (use services)
