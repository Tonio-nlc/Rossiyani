# components/knowledge-workspace/

Reader 2.0 — interactive linguistic microscope panels.

## Panels

| Component | Data source |
|-----------|-------------|
| `WordIdentityPanel` | `WordKnowledgeWorkspace.occurrence` |
| `WhyThisFormPanel` | canonical + occurrence + FR comparison |
| `ParadigmPanel` | `lemmaKnowledge.forms` |
| `UsagePanel` | stats, phrase, examples |
| `ConceptPanel` | `concepts` + `/api/knowledge/concept` |
| `RelatedTextsPanel` | `relatedTexts` |

## Rules

- No business logic — fetch via `useKnowledgeWorkspace` → `POST /api/knowledge/workspace`
- API delegates to `features/knowledge/getWordKnowledgeWorkspace`
