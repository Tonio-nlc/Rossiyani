# lib/

Reusable, non-domain-specific utilities.

## Subfolders

| Folder | Role |
|--------|------|
| `constants/` | App-wide constants |
| `utils/` | Generic helpers |
| `validation/` | Zod schemas and validators |
| `formatting/` | Display formatting |

## Files

- `prisma.ts` — Prisma client singleton

## Allowed dependencies

- `@prisma/client`
- `@/types`

Must not import `features/` or `components/`.
