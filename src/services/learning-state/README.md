# Learning State Engine

Represents **current pedagogical state** for each `(userId, patternId)` pair.

This is **not** a mastery score. Six independent dimensions (0–1) are computed:

| Dimension | Meaning |
|-----------|---------|
| `exposure` | Passive contact volume & text diversity (Reader) |
| `observation` | Active attention quality (explore, notice, Vocabulary) |
| `comprehension` | Estimated grasp from explanation depths seen |
| `confidence` | Reliability under recall pressure (Review) |
| `reuse` | Production / retrieval success (Compose, Review) |
| `stability` | Retention over time (decays with absence) |

`lifecycle` (`latent` → `mastered`) is a **derived summary** for UX — dimensions remain authoritative.

## Usage

```typescript
import {
  emptyLearningStateRecord,
  applyLearningEvent,
  computeLearningState,
  recordToInput,
  persistLearningStateRecord,
} from "@/services/learning-state";

let record = emptyLearningStateRecord(userId, patternId);

for (const event of events) {
  record = applyLearningEvent(record, event);
}

const state = computeLearningState(recordToInput(record));
await persistLearningStateRecord(record);
```

## Events (all modules emit the same vocabulary)

```typescript
type PatternLearningEvent =
  | { type: "exposure"; textId; sentenceId }
  | { type: "notice"; surface: "reader" | "vocabulary" }
  | { type: "explore"; surface; depth? }
  | { type: "explain"; depth }
  | { type: "connect"; relatedPatternId }
  | { type: "retrieve"; success }
  | { type: "produce"; success };
```

## Future consumers

- **Learning Orchestrator** — `toOrchestratorEncounterSignals(state)`
- **Review** — `retrieve` events update `confidence` + `reuse`
- **Compose** — `produce` events update `reuse` independently of `exposure`
- **Home** — aggregate dimension profiles, not binary “mastered”
- **Vocabulary** — `explore` / `explain` on `explore_vocabulary`

## Persistence

`UserLearningPatternState` (Prisma) stores raw aggregates + cached dimension scores.

Run: `npx prisma migrate dev --name user_learning_pattern_state`

## Bridge from local encounters

`learningStateRecordFromEncounter()` migrates `pattern-encounter-store` data until server sync ships.
