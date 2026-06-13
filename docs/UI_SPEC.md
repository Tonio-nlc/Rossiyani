# UI_SPEC.md

# Purpose

This document defines the user interface of the application.

The interface is a learning tool.

Visual clarity is more important than feature quantity.

The user must immediately understand:

* sentence structure
* word function
* grammatical relationships
* Russian logic

---

# Design Philosophy

The application should feel like:

* a reading tool
* a linguistic microscope
* an analysis workspace

The application should NOT feel like:

* a SaaS dashboard
* a CRM
* a project management tool
* a language game

---

# Main Pages

## Library Page

Purpose:

Display available texts.

Information displayed:

* title
* level
* source
* number of sentences

Filters:

* level
* search

Layout:

Simple vertical list.

---

## Reader Page

Purpose:

Read and analyze Russian content.

This is the most important page of the application.

---

# Reader Layout

The page contains three zones.

## Zone 1

Text Reader

Displays sentences.

Each sentence is a separate block.

Example:

Sentence 1

Sentence 2

Sentence 3

---

## Zone 2

Sentence Analysis Panel

Appears when a sentence is clicked.

Contains:

* Russian sentence
* literal French translation
* natural French translation
* Russian logic explanation
* word order explanation
* native usage notes

---

## Zone 3

Word Analysis Panel

Appears when a word is clicked.

Contains:

* original form
* lemma
* stress
* part of speech
* grammatical features
* explanation

---

# Word Coloring System

Every word receives a color according to its grammatical category.

Noun:

Blue

Verb:

Red

Adjective:

Green

Pronoun:

Orange

Adverb:

Purple

Preposition:

Gray

---

# Ending Highlight System

Word colors indicate category.

Ending highlights indicate grammatical information.

Example:

дома

Word color:

noun color

Ending underline:

genitive color

The entire word must never become a case color.

Only the ending should display case information.

---

# Stress Display

Stress marks are visible by default.

Example:

сего́дня

говори́ть

краси́вый

The learner should never have to guess the stress.

---

# Native Expression Display

Native expressions should be visually grouped.

Example:

мне кажется

should be displayed as a detected structure.

---

# Collocation Display

Collocations should be visually grouped.

Example:

принимать решение

should be identified as a single native expression.

---

# Information Density

The interface must avoid overwhelming the learner.

Default view:

simple reading

Advanced information appears only after interaction.

---

# Mobile Support

Mobile support is required.

However desktop experience is the primary target for V1.

---

# Accessibility

Readable typography required.

No low-contrast text.

No decorative effects that reduce readability.

Learning clarity takes priority over visual style.
