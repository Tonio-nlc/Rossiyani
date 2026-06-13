# pipeline/

Import pipeline — transforms raw Russian text into persisted Knowledge Graph data.

## Flow

```text
Texte
  → Segmentation
  → Analyse morphologique
  → Détection expressions figées
  → Détection collocations
  → Analyse syntaxique
  → Génération explications
  → Traduction littérale
  → Traduction naturelle
  → Points culturels
  → Stockage JSON
  → Knowledge Graph
```

**AI is invoked only in the `analysis` step** (via `analyzeWithKnowledge`).
All other stages decompose, validate, or persist the precomputed output.

## Usage

```typescript
import { runTextImportPipeline } from "@/pipeline";

const result = await runTextImportPipeline(input, provider, options);
```

## Dependencies

- `@/domain` — pipeline context types
- `@/services/ai` — AIProvider (import only)
- `@/services/knowledge` — cache lookup
- `@/services/knowledge-graph` — graph merge
