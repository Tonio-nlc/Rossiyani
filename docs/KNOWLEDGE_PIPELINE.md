# Knowledge Pipeline — Industrial Import & Backfill

Documentation for Sprint G4: bulk acquisition, backfill, review, morphology engine, metrics.

---

## 1. Complete data flow

```text
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ File/Folder │ ──► │ ImportQueue  │ ──► │ importRussianText│
└─────────────┘     │  (Prisma)    │     └────────┬────────┘
                    └──────────────┘              │
                                                  ▼
                    ┌──────────────────────────────────────────┐
                    │ cleanText → segmentSentences              │
                    │ duplicate check (contentHash)             │
                    │ analyzeWithKnowledge (cache → AI)         │
                    │ persistSentenceAnalysis                   │
                    │ mergeOccurrence → KnowledgeGraph          │
                    └──────────────────────────────────────────┘
```

### Backfill (no AI)

```text
Existing Text/Sentence/Word/PhraseGroup
  → reconstructAnalysisFromSentence()
  → indexFromAnalysis()        (idempotent upsert)
  → mergeOccurrence()          (idempotent occurrence keys)
```

---

## 2. Bulk import architecture

### Services (`src/services/bulk-import/`)

| File | Role |
|------|------|
| `bulk-import-service.ts` | Folder → queue → run → report |
| `import-queue.ts` | Persistent `ImportJob` / `ImportJobItem` |
| `duplicate-detection.ts` | SHA-256 content hash |
| `read-import-files.ts` | `.txt`, `.md` folder reader |
| `process-bulk-item.ts` | Single file through standard import |

### Queue states

**Job:** `PENDING | PROCESSING | PAUSED | COMPLETED | FAILED`

**Item:** `PENDING | PROCESSING | COMPLETED | FAILED | SKIPPED_DUPLICATE`

### Duplicate detection

```text
rawText → cleanText() → normalize → SHA-256 → Text.contentHash (unique)
```

Re-import of identical content returns `skippedDuplicate: true` without AI.

### Progress metrics

| Field | Meaning |
|-------|---------|
| `filesImported` | Completed + skipped duplicates |
| `sentencesProcessed` | Sentences through pipeline |
| `knowledgeHits` | Sentence cache hits (no AI) |
| `knowledgeMisses` | Cache misses |
| `aiCalls` | Actual AI invocations |
| `estimatedSecondsRemaining` | Based on elapsed time per file |

### API

```http
POST /api/admin/import/bulk
GET  /api/admin/import/jobs/[jobId]
POST /api/admin/import/jobs/[jobId]   # resume
```

### CLI

```bash
npm run import:bulk -- ./corpus/russian --name "Corpus A" --level B1
```

---

## 3. Backfill strategy

**Service:** `src/services/backfill/knowledge-backfill-service.ts`

- Iterates all `Text` rows (or `textIds` filter)
- Reconstructs `SentenceAnalysisOutput` from DB
- Calls existing index + merge — **no AI**
- **Idempotent:** unique keys on `KnowledgeOccurrence`, upserts elsewhere

### API / CLI

```http
POST /api/admin/backfill
Body: { "textIds": ["..."], "dryRun": false }
```

```bash
npm run backfill:knowledge
npm run backfill:knowledge -- --dry-run
```

### Report fields

`textsProcessed`, `sentencesProcessed`, `wordsIndexed`, `occurrencesCreated`,
`occurrencesSkipped`, `phraseOccurrencesCreated`, `conceptsLinked`, `executionTimeMs`

---

## 4. Merge strategy

**Service:** `src/services/knowledge-graph/admin/merge-service.ts`

| Method | Action |
|--------|--------|
| `mergeConcepts` | Re-link lemma/ending/phrase/concept relations, sum hitCount |
| `mergeExplanations` | Promote canonical explanation |
| `mergePhraseGroups` | Move occurrences, re-link concepts |
| `mergeEndings` | Re-link concepts, sum hitCount |

No data loss: occurrences re-pointed before delete.

---

## 5. Review workflow (foundation)

**Service:** `src/services/knowledge-graph/admin/`

| Capability | File |
|------------|------|
| Promote / reject | `knowledge-review-service.ts` |
| Review candidates | `review-candidates.ts` |
| Merge entities | `merge-service.ts` |

### Candidate types

- `duplicate_explanation`
- `low_confidence` (Sentence.needsReview)
- `orphan_concept`
- `unused_lemma`
- `conflicting_canonical`

```http
GET /api/admin/review/candidates?limit=100
```

No UI in this sprint — clean service boundaries only.

---

## 6. Morphology engine

**Service:** `src/services/morphology-engine/`

```typescript
import { analyzeMorphology } from "@/services/morphology-engine";

const result = await analyzeMorphology({
  lemma: "городок",
  partOfSpeech: "noun",
  ending: "е",
  case: "prepositional",
  original: "городке",
  stem: "городк",
  context: { previousWord: { original: "в", partOfSpeech: "preposition" } },
});
```

Output: stem, ending, reason, question answered, preposition, canonical explanation,
French comparison, related concepts, similar examples.

Reader panels will migrate to this engine incrementally.

---

## 7. Metrics (development)

**Service:** `src/services/knowledge-metrics/`

```http
GET /api/admin/metrics
```

Returns: knowledge coverage %, AI calls, graph size, top lemmas/endings/concepts/collocations,
review pending count, import job stats.

---

## 8. Future scalability

| Concern | Current approach | Future option |
|---------|------------------|---------------|
| Queue storage | SQLite `ImportJob` | Postgres / Redis queue |
| Bulk concurrency | Configurable (default 1) | Worker pool |
| Partial form merge | Full sentence cache only | F2 targeted AI per token |
| Metrics | Aggregate on demand | Time-series table |
| Corpus size | Sequential + delay | Batch API + Turso |

Architecture unchanged: `components → features → services → lib`.

---

## 9. Related docs

- `docs/LINGUISTIC_LIBRARY.md` — lookup layer
- `docs/KNOWLEDGE_GRAPH.md` — graph merge & concepts
- `docs/CONTENT_IMPORT_SPEC.md` — validation rules
