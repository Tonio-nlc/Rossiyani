# services/backfill/

Populates LinguisticLibrary + KnowledgeGraph from existing Text/Sentence data without AI.

## Usage

```typescript
import { knowledgeBackfillService } from "@/services/backfill";
const report = await knowledgeBackfillService.run();
```

Idempotent: `mergeOccurrence` skips duplicate `(formId, sentenceKey, wordPosition)`.
