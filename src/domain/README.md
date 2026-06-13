# domain/

Canonical domain model for Rossiyani — interactive Russian reading platform.

## Philosophy

- **AI only at import** — the reader never calls AI.
- **All analyses persisted** — every pipeline stage output is stored and reusable.
- **Knowledge Graph** — cross-text entities accumulate with each import.

## Entity mapping (domain → Prisma)

| Domain entity | Prisma model | Role |
|---------------|--------------|------|
| `Text` | `Text` | Imported reading material |
| `Sentence` | `Sentence` | Sentence instance in a text |
| `Lemma` | `KnowledgeLemma` | Canonical dictionary headword |
| `WordForm` | `KnowledgeForm` | Inflected surface form |
| `Ending` | `KnowledgeEnding` | Reusable ending card |
| `Case` | `KnowledgeCase` | Grammatical case node |
| `Concept` | `KnowledgeConcept` | Pedagogical concept |
| `Expression` | `KnowledgePhrase` (FIXED_EXPRESSION, NATIVE_CONSTRUCTION) | Fixed / idiomatic phrase |
| `Collocation` | `KnowledgePhrase` (COLLOCATION) | Word co-occurrence pattern |

## Graph relations

```text
Lemma ──→ WordForms
Lemma ──→ Expressions
Case  ──→ Endings
Concept ──→ Sentences
Concept ──→ Lemmas
Expression ──→ Sentences
Sentence ──→ Text
```

## Dependencies

- `@/types` for shared enums
- No imports from `services/`, `features/`, or `components/`
