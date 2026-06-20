# PROJECT CONTEXT

Last updated: 2026-06-20

---

# 1. PRODUCT

## Name

Rossiyani

## Mission

Rossiyani is an immersive language learning platform designed for advanced learners who want to understand authentic content instead of memorizing vocabulary.

The product prioritizes deep comprehension, context, media integration and natural language acquisition.

It should feel like a premium productivity tool, not a gamified language app.

---

# 2. CORE PRINCIPLES

Everything must follow these priorities:

1. Clarity over decoration
2. Fast access to content
3. Minimal cognitive load
4. Beautiful typography
5. High information density
6. Premium dark interface
7. Smooth interactions
8. Native feeling

---

# 3. DESIGN PHILOSOPHY

The interface should feel inspired by:

- Linear
- Raycast
- Apple
- Notion
- Readwise

Avoid:

- Large empty heroes
- Marketing pages
- Huge cards
- Excessive gradients
- Visual noise

Spacing should remain compact.

---

# 4. PRODUCT AREAS

Current sections:

- Home
- Library
- Reader
- Explorer
- Compose
- Practice
- Settings

Reader is the primary experience.

---

# 5. LIBRARY

Purpose:

Manage learning content.

Supports:

- Collections
- Categories
- Texts

Do NOT use "Sources".

Collections are curated groups like:

- Everyday Russian
- News
- Literature
- Podcasts

---

# 6. READER

The reader is the flagship feature.

Goals:

- Comfortable reading
- Sentence-by-sentence audio
- Word analysis
- Grammar analysis
- Instant translations
- Minimal distractions

Never redesign the reader without explicit instruction.

---

# 7. AI ANALYSIS

Pipeline:

Text

↓

Sentence segmentation

↓

Morphological analysis

↓

Grammar analysis

↓

Translation

↓

Audio generation

↓

Media Layer generation

Store analysis permanently.

Never recompute if already available.

---

# 8. AUDIO

Audio should be:

- generated automatically
- sentence separated
- reusable
- cached
- synchronized with reader highlighting

---

# 9. MEDIA LAYER

Every analyzed text may contain:

- images
- maps
- videos
- cultural references
- historical references
- person cards

Media is contextual, never decorative.

---

# 10. DESIGN SYSTEM

Typography:

Information first.

Buttons:

Compact.

Cards:

Small radius.

Spacing:

Dense but breathable.

No oversized titles.

No giant heroes.

Desktop first.

---

# 11. CURRENT STATE

Completed:

- Home redesign
- Library redesign
- Navigation improvements

In progress:

- Compose redesign
- Audio integration
- Media Layer

Next priorities:

1. Audio pipeline
2. Media Layer
3. Collections
4. Reader improvements

---

# 12. LONG TERM VISION

Rossiyani should become the best platform for learning languages through authentic content.

The competitive advantage is:

- superior linguistic analysis
- reusable knowledge graph
- integrated media
- premium UX
- low API cost through persistent computation

---

# 13. RULES FOR AI AGENTS

Before modifying anything:

- Understand existing architecture.
- Preserve design consistency.
- Avoid unnecessary refactors.
- Prefer extending over rewriting.
- Never create duplicate components.
- Keep code modular.
- Keep performance in mind.

Always explain major architectural decisions.

Never introduce temporary hacks if a clean solution exists.
