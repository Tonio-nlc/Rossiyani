# Rossiyani — Project Context

## Project Goal

Rossiyani is a French-native Russian learning application.

The purpose is NOT to be a dictionary, translator, flashcard app, or grammar encyclopedia.

The purpose is to make Russian sentence structure, endings, declensions, and native constructions visually obvious.

The learner should understand:

- why a form exists
- why a case is used
- why the word order is chosen
- how Russian logic differs from French logic

The target audience is French-speaking learners of Russian.

All pedagogical decisions should prioritize French ↔ Russian comparison.

---

# Current Product Philosophy

This project is built around one central idea:

Russian endings should be visually dominant.

Example:

городке

The learner should immediately see:

городок
↓
городке

stem = городк
ending = е

case = locative

reason = в + locative

The eye should identify the ending before reading explanations.

---

# Architecture Decisions

Russian-only application.

No multilingual support.

No user accounts.

No gamification.

No SRS.

No Anki integration.

No audio features (yet).

No statistics features (yet).

The project currently focuses only on:

Text
→ Analysis
→ Understanding

---

# Tech Stack

- Next.js
- TypeScript
- Prisma
- SQLite
- OpenAI / Anthropic providers
- Zod validation

AI providers are abstracted through:

AIProvider

Current providers:

- OpenAIProvider
- ClaudeProvider

Selected through:

AI_PROVIDER

environment variable.

---

# Database Structure

Core entities:

## Text

Stores imported texts.

## Sentence

Stores sentence-level analysis:

- russianText
- literalTranslation
- naturalTranslation
- russianLogic
- orderExplanation
- nativeUsageNotes
- register
- difficultyScore
- needsReview
- reviewMessage

## Word

Stores word-level analysis:

- original
- lemma
- stressMarked
- stem
- ending
- partOfSpeech
- case
- gender
- number
- tense
- aspect
- explanation
- frequency
- frequencyTier

## PhraseGroup

Types:

- COLLOCATION
- FIXED_EXPRESSION
- NATIVE_CONSTRUCTION

Fields:

- label
- explanation
- startPosition
- endPosition

---

# Major Decisions Already Made

## Punctuation

Punctuation is NOT stored as Word entries.

Words contain only linguistic tokens.

The display layer reconstructs punctuation.

Decision: KEEP.

---

## Stem + Ending

The application relies heavily on:

stem
+
ending

for pedagogical visualization.

Decision: KEEP.

---

## Register

Supported:

- neutral
- informal
- formal
- literary
- slang

Decision: KEEP.

---

## Native Usage Notes

Sentence-level note explaining how common or natural a construction is.

Decision: KEEP.

---

# Problems Already Solved

## Import Pipeline

Fixed:

- OpenAI integration
- JSON parsing
- Zod validation
- Prisma persistence

Import now works successfully.

---

## PhraseGroup Schema Mismatch

Resolved.

Canonical format:

{
  "type": "...",
  "label": "...",
  "startPosition": 0,
  "endPosition": 1,
  "explanation": "..."
}

---

## Stem Validation

Resolved.

Validation now supports:

- surface stems
- normalized stems
- model-generated lemma-based stems

---

# Current UI Evaluation

The MVP works.

However:

The interface still behaves more like an annotated reader than a Russian-learning machine.

The biggest weakness is:

Russian endings do not stand out enough.

This is the main area of active development.

---

# Approved UI Direction

Pedagogy-first redesign.

Priority order:

1. EndingBadge
2. Case visual system
3. MorphologyLadder
4. WhyThisForm panel
5. ReaderWorkspace redesign
6. SentenceInsightBar

---

# Educational Priorities

Highest priority:

- endings
- cases
- declensions
- Russian logic
- French comparison

Lower priority:

- POS information
- frequency information

---

# French Comparison Principle

Whenever possible:

Show:

Russian structure

↓

French structure

↓

Explanation of difference

Example:

в городке

French:

dans la petite ville

Why:

Russian uses locative.
French uses a preposition without case marking.

This comparison is central to the product.

---

# Current Known Issue

After the latest Reader UI redesign, a runtime error appeared:

undefined is not an object (evaluating 'originalFactory.call')

Backend works.

Import works.

Database works.

The issue is believed to be inside one of the new reader components:

- EndingBadge
- WordToken
- MorphologyLadder
- ReaderWorkspace
- SentenceInsightBar

This should be investigated before continuing UI work.

---

# Development Rule

Do NOT redesign architecture.

Do NOT redesign database schema.

Do NOT add major features.

Focus on pedagogical improvements and UI clarity.

The project's success depends on making Russian grammar visually obvious.