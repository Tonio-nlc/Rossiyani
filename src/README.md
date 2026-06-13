# src/

Application source root.

## Structure

| Folder | Role |
|--------|------|
| `app/` | Next.js routes and API handlers |
| `components/` | UI only — no business logic |
| `features/` | Domain logic |
| `services/` | External integrations (AI, parser, import) |
| `lib/` | Shared infrastructure |
| `hooks/` | React hooks |
| `types/` | TypeScript types |
| `styles/` | Style helpers |

## Dependency direction

`app` → `components` → `features` → `services` → `lib`

`components` must not import `services` or `prisma` directly.

See `docs/ARCHITECTURE.md`.
