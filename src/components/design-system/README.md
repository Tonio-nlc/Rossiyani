# Rossiyani Design System

Source of truth: `/design/design-system.md`, `/design/component_library.md`.

All UI must reuse components from this folder. Never create page-local duplicates.

## Layout

| Component | Use |
|-----------|-----|
| `EditorialContainer` | Canonical page frame — max 1024px, horizontal gutters |
| `ReadingLayout` | Reader — main text column + microscope sidebar |
| `Sidebar` | Microscope panel, inline (desktop) or sheet (mobile) |

## Navigation & chrome

| Component | Use |
|-----------|-----|
| `TopNavigation` | Global sticky header |

## Content

| Component | Use |
|-----------|-----|
| `SectionHeader` | Page / section intros |
| `EditorialCard` | Flat bordered content cards |
| `CollectionCard` | Library collection tiles |
| `EmptyState` | Zero-data states |

## Inputs & actions

| Component | Use |
|-----------|-----|
| `SearchField` | Search with optional result count |
| `InputField` | Text, textarea, select |
| `PrimaryButton` | Oxford Blue CTA — 4px radius |
| `GhostButton` | Underlined secondary action |
| `Tag` | Filter chips and static labels |
| `PracticeInput` | Large editorial answer field |
| `ExerciseCard` | Flat exercise / result surface |
| `PracticeMarginNote` | Subdued contextual help |

## Feedback

| Component | Use |
|-----------|-----|
| `ProgressBar` | Flat Oxford Blue bar — 4px height |
| `Dialog` | Modals, confirm, search overlay |
| `Toast` / `ToastProvider` | Transient notifications |

## Structure

| Component | Use |
|-----------|-----|
| `Divider` | Hairline separator |

## Tokens (globals.css)

- Paper: `--paper` `#fbf9f4`
- Surface: `--surface-primary` `#f5f3ee`
- Primary: `--color-primary` `#1A2E44`
- Secondary: `--color-secondary` `#8c3a32`
- Border: `--hairline` `#dbdad5`
- Text: `--ink` `#1b1c19`
- Muted: `--ink-muted` `#5f6468`
- Radius: `--ds-radius` `4px`

Semantic colors (`--color-grammar`, etc.) are **text/border only** — never panel backgrounds.
