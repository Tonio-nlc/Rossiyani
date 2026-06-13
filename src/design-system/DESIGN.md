# Rossiyani Design System — Implementation

**Version 2.0 — Editorial Foundations (Phase 3)**

The canonical source of truth lives in `/design/`:

- `design/brandbook.md`
- `design/design-system.md`
- `design/logo.md`
- `design/pages.md`
- `design/redesign-roadmap.md`

If anything in this folder conflicts with `/design/`, the design documents win.

---

## Phase 3 — Delivered

### CSS tokens (`src/app/globals.css`)

| Token | Value | Role |
|-------|-------|------|
| `--paper` | `#F6F4EF` | Page background |
| `--surface-primary` | `#FCFBF8` | Primary surface |
| `--surface-secondary` | `#F0ECE4` | Secondary surface |
| `--ink` | `#1F1F1D` | Primary text |
| `--ink-secondary` | `#66635F` | Body secondary |
| `--ink-muted` | `#8A867F` | Metadata |
| `--color-link` | `#5F768D` | Navigation, links, references |
| `--color-grammar` | `#74806F` | Grammar, morphology |
| `--color-culture` | `#B39255` | Culture, etymology, concepts |
| `--color-exception` | `#8A4C43` | Exceptions, warnings |
| `--hairline` | `rgba(31,31,29,0.1)` | Separators |

Legacy variables (`--accent-violet`, `--surface-elevated`, etc.) are aliases during migration.

### Programmatic tokens (`src/design-system/tokens.ts`)

For TypeScript consumers.

### Editorial components (`src/components/editorial/`)

| Component | Role |
|-----------|------|
| `Chapter` | Page wrapper, content max-width, rhythm |
| `Section` | Editorial section with eyebrow / title / intro |
| `EditorialTitle` | Hero, page, section titles |
| `MetadataLine` | Printed metadata (`Verbe · 128 occurrences`) |
| `Hairline` | 1px separator |
| `MarginNote` | Sidebar annotation (grammar, usage, culture…) |
| `KnowledgeChain` | Relationship diagram (`↓` chain) |
| `Reference` | Editorial link |
| `IndexList` | List-based index (not cards) |

### Utility classes

- `.editorial-title`, `.editorial-hero`, `.editorial-section-title`
- `.text-eyebrow`, `.text-metadata`, `.editorial-intro`
- `.hairline`, `.editorial-section`, `.link-editorial`
- `.text-link`, `.text-grammar`, `.text-culture`, `.text-exception`

---

## Forbidden (do not reintroduce)

- Dark premium theme
- Violet/cyan startup accents
- Shadows, glow, gradients
- `card-hover` lift effects
- Dashboard grids as default layout

---

## Next: Phase 4 — Global Layout ✅

- Permanent left sidebar (table of contents)
- Removed top header dashboard navigation
- Removed mobile emoji bottom bar
- `PageCanvas` wraps all page content from `AppShell`
- Routes: `/reader` (entry), `/settings` (placeholder)

## Phase 5 — Home ✅

## Phase 5.1 — Home Rebuild (Editorial Workspace) ✅

## Phase 5.2 — Premium Language Studio Home (superseded)

## Phase 5.3 — Editorial Index Home (superseded)

## Phase 5.4 — Language Journal Home ✅

- Word of the day, review pills, Featured (lesson + continue reading), Practice placeholder
- No progression statistics or progress bars

## Phase 6 — Reader ✅

- Reading column (760px) + editorial margin (320px)
- Annotations in margin via `ReaderMarginPanel`
- No bottom microscope, no hover popovers, no progress bar
- Typography-first sentences, subtle word selection
- Search via `/` only when active

## Phase 7 — Explorer ✅

- Editorial atlas hub (not SaaS search)
- Large search as entry point → relationship expansion via `KnowledgeChain`
- Editorial Index (Grammar, Vocabulary, Pronunciation, Morphology, Culture, Texts, Expressions)
- Knowledge Canvas — typographic concept chain, no graph viz
- Today's Connection (reuses home daily chain)
- Recently Explored — index list, no chips
- Collections index via `IndexList`

## Next: Phase 8 — Manual
