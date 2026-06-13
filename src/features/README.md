# features/

Domain business logic for Russian deep reading.

## Subfolders

| Folder | Role |
|--------|------|
| `texts/` | Text catalog queries and filters |
| `sentences/` | Sentence analysis retrieval |
| `words/` | Word analysis retrieval |
| `grammar/` | POS colors, case ending display rules |
| `import/` | Russian text import entry point |
| `knowledge/` | LinguisticLibrary orchestration |

## Must not contain

- React components
- Direct HTTP to AI APIs (use `services/ai`)

## Allowed dependencies

- `@/services`
- `@/lib`
- `@/types`
