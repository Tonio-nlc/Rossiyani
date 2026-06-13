# services/morphology-engine/

Canonical pedagogical explanation generator — Reader-independent.

## Input → Output

```text
Lemma + Ending + Case + POS + Context
  → stem, ending, reason, question, preposition
  → canonical explanation, FR comparison
  → related concepts, similar examples
```

Uses `getLemmaKnowledge` and `getEndingKnowledge` from features/knowledge.
