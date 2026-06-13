# app/

Next.js App Router: pages, layouts, and API route handlers.

## Responsibilities

- Route definitions
- Thin handlers that delegate to `features/`

## Must not contain

- Business logic
- Direct AI provider calls
- Grammar rules

## Allowed dependencies

- `@/components`
- `@/features`
- `@/lib` (minimal, e.g. prisma only in API routes via features preferred)
