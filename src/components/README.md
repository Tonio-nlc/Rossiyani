# components/

Presentational and interactive UI only.

## Subfolders

| Folder | Role |
|--------|------|
| `ui/` | shadcn/ui primitives |
| `layout/` | App shell, navigation |
| `reader/` | Text reader (zone 1) |
| `sentence/` | Sentence blocks and panel (zone 2) |
| `word/` | Word tokens and panel (zone 3) |
| `analysis/` | Shared analysis display pieces |

## Must not contain

- Prisma or SQL
- AI provider calls
- Import pipeline logic
- Grammar detection logic (use `features/grammar` for rules)

## Allowed dependencies

- `@/hooks`
- `@/features/grammar` (display constants only)
- `@/types`
- `@/lib/formatting`
