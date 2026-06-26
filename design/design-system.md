# Rossiyani Design System v2

## Product Identity

Rossiyani is a **living learning platform** — fluid, responsive, energetic, premium.

Not editorial. Not a quiet library. Not beige minimalism.

Inspiration mix: Busuu, Linear, Arc, Apple, Raycast, Airbnb — without copying any.

---

## Design Principles

1. **Every component reacts** — hover, focus, selection, scroll, loading, completion
2. **Large rounded shapes** — 20–32px radius on cards and surfaces
3. **Modern spacing** — generous whitespace, effortless sections
4. **Dynamic backgrounds** — subtle gradients, soft halos, atmosphere (not decoration)
5. **Area accents** — each major zone has its own visual identity

---

## Area Color Accents

| Area | Accent |
|------|--------|
| Library | Warm sand `#faf7f2` |
| Reader | Blue `#f0f5ff` |
| Practice | Green `#f0fdf6` |
| Explorer | Violet `#f5f3ff` |
| Vocabulary | Amber `#fffbeb` |
| Manual | Neutral slate `#f8fafc` |

Primary identity blue: `#0058BE`

---

## Motion

- Duration: 200–250ms default, 380ms for panels
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (spring-like)
- Cards: lift + scale(1.01) on hover
- Buttons: scale(1.02) on hover, scale(0.96) on press

---

## Typography

Premium SaaS — no editorial feeling.

- Headlines: Inter 700, `#111827`
- Body: Inter 400, `#64748B`
- Labels: Inter 600 uppercase, `#94A3B8`
- Russian reading content: serif only in Reader text

---

## Cards

- Gradient: `linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)`
- Border: `rgba(59, 130, 246, 0.1)`
- Shadow: soft, large blur
- Hover: translateY(-3px) scale(1.01), stronger shadow, blue border

---

## Workspace Reference

Rossiyani is a premium language learning workspace built around reading — a personal language-learning operating system where every screen helps the learner decide: *What should I do next?*

### Unified V2 visual language

All major areas share V2 tokens (`workspace-v2.css`): motion, depth, large radii, and area-specific accent backgrounds.

| Area | Wrapper class | Accent |
|------|---------------|--------|
| Home / Import | `home-ws` | Blue page `#f7f9fb` |
| Library | `library-ws` | Warm sand |
| Reader | `reader-ws` | Blue immersive |
| Practice | `practice-shell` | Green |
| Explorer | `explorer-study-root` | Violet |
| Manual | `manual-scholar` | Slate |

---

# Interface Architecture (legacy notes)

## Workspace System

Used for:

* Home
* Explorer
* Practice
* Vocabulary
* Profile
* Future analytics

Characteristics:

* Large cards
* Clear hierarchy
* Visible progress
* Strong actions
* Comfortable spacing
* Dashboard feeling

---

## Editorial System (deprecated for new work)

Long-form Reader content uses `reader-ws`. Manual and grammar pages are migrating to V2 slate accent.

---

# Colors

Primary:
#0058BE

Secondary:
#006C49

Tertiary:
#A36700

Background:
#F7F9FB

---

# Typography

## Display
Typography:

Display:
Inter 800

Headline:
Inter 700

Body:
Inter 400

Label:
Inter 600
---

## Interface

Inter

Used for:

* Navigation
* Buttons
* Metadata
* Labels
* Statistics

---

# Layout

Content Width

1400px

Maximum Width

1500px

Desktop Padding

32px

Mobile Padding

20px

---

# Spacing

Base Grid

8px

Section Spacing

80px

Card Internal Padding

24px

Large Card Padding

32px

---

# Radius

Small

12px

Medium

18px

Large

24px

Hero

28px

---

# Cards

Background

White

Border

1px solid #E8E3DA

Shadow

0 8px 32px rgba(15,23,42,0.06)

Hover

TranslateY(-2px)

---

# Buttons

Primary

Background:
#1E3155

Text:
White

Radius:
14px

Height:
48px

---

Secondary

White background

Border:
#E8E3DA

Text:
#1E3155

---

# Motion

Duration

200ms

Easing

ease-out

Allowed

* hover elevation
* subtle fade
* progress transitions

Forbidden

* bounce
* spring
* playful gamification

---

# Success Test

If a screen feels like:

* an academic portal
* a university website
* a document archive

The design failed.

If a screen feels like:

* a premium learning workspace
* a modern SaaS product
* a focused learning dashboard

The design succeeded.
