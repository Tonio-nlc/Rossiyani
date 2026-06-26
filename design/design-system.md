# Rossiyani Design System V3

## Product Identity

Rossiyani is a **premium editorial learning environment** for Russian — calm, luminous, breathable.

Inspiration: Apple, Notion, Linear, Readwise, Kindle — with the tactile warmth of a beautiful book.

Not a dense SaaS dashboard. Not academic beige. White-dominant, subtly tinted canvases.

---

## V3 Principles

1. **One card family** — same radius, shadow, padding, hover lift everywhere
2. **Hero cards** — large rounded surfaces with illustrations, generous whitespace
3. **Area tints** — discrete color per zone; never saturated
4. **Clear hierarchy** — big titles, light subtitles, minimal copy
5. **Unified motion** — 240ms default, 400ms panels, subtle hover only

---

## Implementation

| Layer | File |
|-------|------|
| Tokens + components | `rossiyani-v3.css` |
| Area canvases + card unification | `rossiyani-v3-canvas.css` |
| Header | `rossiyani-header.css` |
| Primitives (search, dialog, toast) | `rossiyani-primitives.css` |
| Page root class | `r3-page-root` on all routes via `app-shell.tsx` |

V2 tokens (`--v2-*`) alias to V3 (`--r3-*`) for backward compatibility.

---

## Area Colors (discrete)

| Area | Canvas | Dominant tint |
|------|--------|---------------|
| Home / Import | `#f5f8fc` | Blue |
| Library | `#faf7f2` | Beige/sand |
| Reader | `#f3f7ff` | Blue |
| Vocabulary | `#f8f5ff` | Violet |
| Lessons | `#fafbfd` | Multicolor gradients |
| Practice | `#f0faf5` | Green |
| Settings / Profile | `#f8fafc` | Neutral |

Primary: `#0058BE`

---

## Cards

| Token | Value |
|-------|-------|
| `--r3-radius-card` | `28px` |
| `--r3-radius-hero` | `32px` |
| Shadow | soft multi-layer, large blur |
| Hover | `translateY(-4px)`, stronger shadow |
| Padding | `1.5rem` standard, `2rem` hero |

React: `<Card hero interactive href="…">`

---

## Buttons

| Variant | Class |
|---------|-------|
| Primary | `r3-btn--primary` / `<PrimaryButton>` |
| Secondary | `r3-btn--secondary` / `<SecondaryButton>` |
| Ghost | `r3-btn--ghost` / `<GhostButton>` |
| Text | `r3-btn--text` / `<TextButton>` |

Min height: `3rem` (48px). Pill radius.

---

## Badges

Unified via `<Badge tone="blue|violet|green|amber|rose|neutral">` and `<Tag>`.

Use for levels, categories, time, grammar cases, collections.

---

## Illustrations

Shared SVG library in `components/design-system/illustrations.tsx`:

`IllustrationBook`, `IllustrationLibrary`, `IllustrationVocabulary`, `IllustrationLessons`, `IllustrationPractice`, `IllustrationReader`, `IllustrationSearch`

Wrap in `.r3-illustration--hero` with area tone modifiers.

---

## Typography

| Role | Style |
|------|-------|
| Eyebrow | `.r3-eyebrow` — 11px uppercase, label color |
| Hero title | `.r3-hero-title` — clamp, -0.04em tracking |
| Section title | `.r3-title` — 20px semibold |
| Lead | `.r3-lead` — 16px, body color, 1.65 line-height |

Font: Inter (`--font-workspace`). Russian reading: serif in Reader body only.

---

## Spacing

8px grid. Section gap `2.5rem`, major gap `5rem` (mobile `3.5rem`).

---

## Motion

- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`
- Duration: `240ms` / `400ms`
- Forbidden: bounce, spring, gamification flourishes

---

## Navigation

Official routes unchanged — see Header section below.

Header: frosted white, pill nav, spotlight search (`/`).

---

## Header & Navigation

| Label | Route | Shortcut |
|-------|-------|----------|
| Home | `/` | Alt+0 |
| Library | `/library` | Alt+1 |
| Reader | `/reader`, `/texts/*` | Alt+2 |
| Vocabulary | `/vocabulary` | Alt+3 |
| Lessons | `/lessons` | Alt+4 |
| Practice | `/practice` | Alt+5 |

Profile: `/settings` · Search: `/` key

---

## Legacy V2 notes

Previous V2 workspace CSS files remain; V3 canvas layer unifies cards and canvases globally. Migrate new work to `<Card>`, `<Badge>`, R3 button components.

---
