# Reader Experience Reconstruction — Sprint Report

**Date:** 2026-06-27  
**Scope:** Reader UI only — no Orchestrator / Learning State changes

## Problem

The Rossiyani 2.0 engine (Learning Patterns, Pattern Instances, Orchestrator) was live, but the Reader still behaved like an interactive dictionary: word → translation → POS → optional pattern card.

## Solution

Rebuilt the right panel and text interaction as a **pedagogical guide**, not a vocabulary fiche.

### New architecture (client-side)

| Layer | Role |
|-------|------|
| `buildPatternBearerWordIds` | Marks words that carry the sentence's primary PatternInstance |
| `buildReaderWordGuide` | Maps orchestrator output + text context → user-facing guide view |
| `ReaderWordGuide` | Notice → discovery → explanation → example |
| `ReaderWordLookupStrip` | Translation, POS, audio, save — always last |
| `ReaderWordPanel` | Orchestrates guide vs lookup-only modes |

### Panel hierarchy (pattern bearer + visible experience)

1. **Pourquoi ainsi ?** — headline from orchestrator (`Pourquoi « сестры » s'écrit ainsi ?`)
2. **Notice** — prior form vs current (`сестра` / `сестры`) before any explanation
3. **Discovery** — transitional line (`Ce changement n'est pas aléatoire.`)
4. **Explanation** — single insight from orchestrator
5. **Example** — sentence in context
6. **Lookup strip** — translation, category, audio, save (compact in guide mode)

### Non-pattern words

All words remain clickable. Non-bearers show translation + audio + save only, with a hint that underlined words hide logic to discover.

### Text ↔ panel dialogue

- Pattern bearer tokens: amber underline (`.reader-word-pattern`)
- Words referenced in the guide: warm highlight (`.reader-word-guide-linked`)
- Linked word IDs computed from prior-lemma lookup in reading order

### Jargon removed from Reader panel

No Learning Pattern, Observation, Insight, L1/L2/L3 labels in the new panel. Copy uses natural French only.

## Target Aha (unchanged)

**Text:** `text-a1-family-01`  
**Click:** `сестры` (pattern bearer)  
**Expected:** Notice comparing `сестра` → `сестры`, then termination insight — not a dictionary card.

## Files touched

- `src/components/reader/reader-word-panel.tsx` — rewritten
- `src/components/reader/reader-word-guide.tsx` — new
- `src/components/reader/reader-word-lookup-strip.tsx` — new
- `src/lib/reader/build-reader-word-guide.ts` — new
- `src/lib/reader/build-pattern-bearer-words.ts` — new
- `src/types/reader-word-guide.ts` — new
- `src/components/reader/reader-workspace.tsx` — wiring
- `src/components/reader/reader-sentence.tsx` — pattern + guide props
- `src/components/sentence/sentence-block.tsx` — all words clickable
- `src/components/word/word-token.tsx` — pattern + guide-linked styles
- `src/app/reader-workspace-guide.css` — guide + lookup + token styles

## Not changed (by design)

- Learning Orchestrator
- Learning State / session store
- Pattern Indexer
- `ReaderPatternCard` — kept for Vocabulary fiche

## Manual test plan

1. Open `text-a1-intro-01` — pattern words underlined; ordinary clicks → lookup strip only
2. Open `text-a1-family-01` — click `сестра` first (observation), then `сестры` (insight + notice)
3. Verify `сестра` and `сестры` stay highlighted in text while panel is open
4. Close panel — one clear idea retained, vocabulary secondary
5. Complete intro → family via completion card navigation
