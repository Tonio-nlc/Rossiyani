# Rossiyani — Final Architecture (V1)

This document is the approved architecture for Russian Deep Reading V1.
It supersedes exploratory proposals where they differ.

---

## Product philosophy

The **linguistic analysis engine** is the core product.
The **reader** is a visualization layer only.

Priority order for every decision:

1. Analysis quality
2. Maintainability
3. Simplicity

V1 is **Russian only**. No multilingual abstractions, interfaces, or configuration unless they cost nothing for V1 (they do not — so they are excluded).

---

## Scope (V1)

| In scope | Out of scope |
|----------|--------------|
| Russian text import and AI analysis | Other languages |
| Precomputed analysis stored in DB | Runtime AI in the reader |
| Text library, reader, admin import | V2: audio, Anki, SRS, accounts, stats |
| French pedagogical output (via AI prompts) | Gamification |

---

## Layered architecture

```text
┌─────────────────────────────────────────────────────────┐
│  Presentation                                           │
│  src/app          — routes, layouts, API route shells   │
│  src/components   — display and user interaction only   │
└───────────────────────────┬─────────────────────────────┘
                            │ calls
┌───────────────────────────▼─────────────────────────────┐
│  Domain                                                 │
│  src/features     — business rules, orchestration       │
└───────────────────────────┬─────────────────────────────┘
                            │ calls
┌───────────────────────────▼─────────────────────────────┐
│  Integrations                                           │
│  src/services     — AI (via AIProvider), parser, import   │
└───────────────────────────┬─────────────────────────────┘
                            │ calls
┌───────────────────────────▼─────────────────────────────┐
│  Foundation                                             │
│  src/lib          — prisma client, validation, utils      │
│  src/media        — media catalog, providers, delivery  │
│  src/types        — shared TypeScript types               │
│  prisma/          — schema and migrations                 │
└─────────────────────────────────────────────────────────┘
```

### Media Layer

All product modules resolve media through `src/media/` (`MediaAsset`, catalog ids).
See `docs/MEDIA_LAYER.md`. Product code must never reference file paths or storage backends directly.

### Dependency rules

- `components` → `features` → `services` → `lib`
- `components` must never import `services` or `lib/prisma` directly
- `features` must never depend on a specific AI vendor
- `services/ai` exposes only `AIProvider`; implementations live under `providers/`

---

## Core systems

### 1. Analysis engine (primary)

Responsibility: turn one Russian sentence into structured pedagogical data.

- Prompt contract: `docs/AI_ANALYSIS_SPEC.md`
- Output validated before persistence (Zod, to be wired in import feature)
- Produces per sentence: translations, grammar notes, word order, **difficultyScore (1–5)**
- Produces per word: morphological fields, **stem**, **ending**, **frequency**, optional **frequencyTier**
- Produces **phraseGroups**: collocations, fixed expressions, native constructions
- Uncertainty → `needsReview` + `reviewMessage` on sentence; never invent data

All analysis runs at **import time**, not when reading.

### 2. Import pipeline

Responsibility: paste → clean → segment → analyze → validate → store.

Orchestration: `src/services/import/import-russian-text.ts`.
Entry point: `src/features/import/import-russian-text.ts`.
Steps defined in `docs/CONTENT_IMPORT_SPEC.md`.

Russian-only sentence segmentation in `src/services/parser/`.

### 3. Reader (visualization)

Responsibility: load precomputed `Text`, `Sentence`, `Word` from DB and render three zones (`docs/UI_SPEC.md`).

No business logic in UI components.
Grammar colors and ending highlights: `src/features/grammar/` (display rules only).

### 4. AI provider abstraction

```text
AIProvider (interface)
    ├── ClaudeProvider
    └── OpenAIProvider
```

Application code selects implementation via configuration (`AI_PROVIDER` env).
Switching provider must not require changes outside `src/services/ai/`.

---

## Data flow

### Read path

```text
Reader page → features/texts → Prisma → SQLite
           → features/sentences / features/words (on selection)
```

No AI calls.

### Import path (implemented)

```text
POST /api/admin/texts/import
  → features/import
  → services/import (clean → segment → analyze → persist)
  → KnowledgeLookupService (cache hit → skip AI)
  → analyzeWithKnowledge() → AIProvider (on miss) → Zod
  → LinguisticLibraryIndexer → persist Text/Sentence/Word
```

See `docs/LINGUISTIC_LIBRARY.md` and `docs/KNOWLEDGE_GRAPH.md` for the cross-text knowledge layer.

---

## API routes (V1 shells)

| Route | Role |
|-------|------|
| `GET /api/texts` | Library list |
| `GET /api/texts/[id]` | Text with sentence summaries |
| `GET /api/texts/[id]/sentences/[sentenceId]` | Full sentence + words |
| `POST /api/admin/texts/import` | Import pipeline (implemented) |

---

## Database

SQLite via Prisma. Schema: `prisma/schema.prisma`.

See [Database schema](#database-schema) below.

**Production note:** file-based SQLite on Vercel serverless is ephemeral. Before production deploy, choose Turso/libSQL or another persistent SQLite host; the Prisma schema stays compatible.

---

## Database schema

### Text

| Field | Type | Notes |
|-------|------|-------|
| id | String | cuid |
| title | String | |
| level | CefrLevel | A1 … Native |
| source | String? | optional |
| createdAt | DateTime | |

### Sentence

| Field | Type | Notes |
|-------|------|-------|
| id | String | |
| textId | String | FK |
| position | Int | order in text |
| russianText | String | |
| literalTranslation | String | French |
| naturalTranslation | String | French |
| russianLogic | String | Russian thinking / construction |
| orderExplanation | String | word order |
| nativeUsageNotes | String | usage frequency and context (French) |
| register | Register | neutral, informal, formal, literary, slang |
| difficultyScore | Int | 1–5 (see scale below) |
| needsReview | Boolean | AI uncertainty flag |
| reviewMessage | String? | Human review note |

**difficultyScore scale**

| Score | Meaning |
|-------|---------|
| 1 | Very easy |
| 2 | Easy |
| 3 | Intermediate |
| 4 | Difficult |
| 5 | Advanced / native |

Used for filtering, sorting, and future learning paths.

### Word

| Field | Type | Notes |
|-------|------|-------|
| id | String | |
| sentenceId | String | FK |
| position | Int | token order |
| original | String | required |
| lemma | String | required |
| stressMarked | String | required |
| stem | String | required; used for ending highlight |
| ending | String | required (may be empty); `original = stem + ending` |
| partOfSpeech | PartOfSpeech | required |
| case | String? | when applicable |
| gender | String? | |
| number | String? | |
| tense | String? | |
| aspect | String? | |
| explanation | String | required |
| frequency | WordFrequency? | Very Common … Rare |
| frequencyTier | FrequencyTier? | Top 500 / 1000 / 3000 / beyond |

**Punctuation (Option B):** not stored as `Word` rows. Punctuation remains in `russianText` only; the reader interleaves punctuation between word tokens via `buildSentenceDisplay()`.

### PhraseGroup

First-class multi-word structures (not reducible to single words).

| Field | Type | Notes |
|-------|------|-------|
| id | String | |
| sentenceId | String | FK |
| type | PhraseGroupType | COLLOCATION, FIXED_EXPRESSION, NATIVE_CONSTRUCTION |
| label | String | e.g. `мне кажется`, `принимать решение` |
| explanation | String | French pedagogical text |
| startPosition | Int | inclusive word index |
| endPosition | Int | inclusive word index |

Examples: `мне кажется`, `по крайней мере`, `принимать решение`, `иметь в виду`.

### Analysis contract

Zod schema: `src/services/ai/schemas/sentence-analysis.schema.ts`.

Prompt: `src/services/ai/prompts/sentence-analysis-prompt.ts`.

---

## Folder structure

```text
/
├── docs/                    # specifications + this file
├── prisma/
│   └── schema.prisma
├── public/
├── src/
│   ├── app/
│   │   ├── api/texts/...
│   │   ├── api/admin/texts/import/...
│   │   ├── library/
│   │   ├── texts/[textId]/
│   │   └── admin/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── reader/
│   │   ├── sentence/
│   │   ├── word/
│   │   └── analysis/
│   ├── features/
│   │   ├── texts/
│   │   ├── sentences/
│   │   ├── words/
│   │   ├── grammar/
│   │   └── import/
│   ├── services/
│   │   ├── ai/
│   │   │   ├── providers/
│   │   │   └── ...
│   │   ├── parser/
│   │   └── import/
│   ├── lib/
│   ├── hooks/
│   ├── types/
│   └── styles/
└── tests/
    ├── parser/
    ├── validation/
    └── grammar/
```

Each major `src/` folder contains a `README.md` describing role and allowed dependencies.

---

## Technology stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router), TypeScript strict |
| Styling | Tailwind CSS, shadcn/ui |
| API | Next.js Route Handlers |
| ORM | Prisma |
| Database | SQLite (dev); persistent host TBD for production |
| Tests | Vitest |
| Hosting | Vercel (target) |
| AI | Pluggable via `AIProvider` |

---

## Implementation order

1. ~~Prisma schema + skeleton~~
2. ~~AI providers + Zod + import pipeline~~
3. ~~Library, admin import, reader UI~~

---

## Document references

- `README_PROJECT.md` — philosophy and workflow
- `docs/SPECIFICATION.md` — stack and conventions
- `docs/AI_ANALYSIS_SPEC.md` — analysis output contract
- `docs/CONTENT_IMPORT_SPEC.md` — import pipeline
- `docs/UI_SPEC.md` — reader layout
- `docs/DEVELOPMENT_RULES.md` — code rules
