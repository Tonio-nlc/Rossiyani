# prisma/

Database schema and migrations.

- `schema.prisma` — source of truth for V1 data model
- Run `npm run db:migrate` after schema changes

SQLite file path is set via `DATABASE_URL` (see `.env.example`).
