# services/

External integrations and cross-cutting pipelines.

## Subfolders

| Folder | Role |
|--------|------|
| `ai/` | `AIProvider` abstraction and implementations |
| `parser/` | Russian text cleaning and sentence segmentation |
| `import/` | Import orchestration (delegates to `@/pipeline`) |
| `knowledge/` | KnowledgeLookupService (before AI) |
| `linguistic-library/` | Index validated analyses into Knowledge* tables |
| `pipeline/` | See `@/pipeline` — staged import pipeline |
| `reader/` | Read-only DB access for word/sentence click (no AI) |
| `knowledge-graph/` | Cumulative pedagogical graph merge & queries |

## Must not contain

- React components
- UI state

## Allowed dependencies

- `@/lib`
- `@/types`

Features call services; services do not call features.
