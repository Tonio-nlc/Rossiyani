# reader/

Read-only services for the interactive reader.

**No AI calls.** All data comes from the precomputed database and Knowledge Graph.

## Usage

```typescript
import { getWordDetailFromDb, getSentenceDetailFromDb } from "@/services/reader";

const detail = await getWordDetailFromDb(wordId);
// detail.explanation, detail.form, detail.lemma, detail.ending, detail.concepts
```

## Dependencies

- `@/lib/prisma`
- `@/domain/mappers`
- `@/services/knowledge-graph` (graph queries)
