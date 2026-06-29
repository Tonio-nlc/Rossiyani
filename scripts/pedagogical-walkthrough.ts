#!/usr/bin/env tsx
/**
 * Simulates beginner word-exploration across Foundation Pack texts 1–3.
 * Usage: npx tsx scripts/pedagogical-walkthrough.ts
 */
import { getTextForReader } from "../src/features/texts/get-text-for-reader";
import {
  buildOrchestratorInputFromReader,
  decidePedagogicalIntervention,
  mapDecisionToReaderExperience,
} from "../src/services/learning-orchestrator";
import { getOrchestratorSession } from "../src/services/learning-orchestrator/session-store";
import type { PatternEncounterState } from "../src/types/reader-pattern-experience";
import { prisma } from "../src/lib/prisma";

const PATH = ["text-a1-intro-01", "text-a1-family-01", "text-a1-home-01"] as const;

function encounter(
  exposureCount: number,
  exploreCount: number,
  textId: string,
  title: string,
  sentenceId: string,
): PatternEncounterState {
  return {
    exposureCount,
    exploreCount,
    lastTextId: textId,
    lastTextTitle: title,
    lastSentenceId: sentenceId,
  };
}

async function walkText(textId: string, pass: number) {
  const text = await getTextForReader(textId);
  if (!text) {
    console.log(`\n✗ ${textId} introuvable`);
    return;
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`${text.title} (${textId}) — passe ${pass}`);
  console.log("=".repeat(60));

  for (const sentence of text.sentences) {
    const ctx = text.patternSlice.bySentenceId[sentence.id];
    const pattern = ctx?.primaryPatternId
      ? text.patternSlice.patterns[ctx.primaryPatternId]
      : null;

    console.log(`\n« ${sentence.russianText.slice(0, 70)}${sentence.russianText.length > 70 ? "…" : ""} »`);
    console.log(`  LP primaire : ${pattern?.userFacingName ?? "—"}`);

    if (!ctx?.instance || !pattern) {
      continue;
    }

    const spanWords = sentence.words
      .filter(
        (w) =>
          w.position >= ctx.instance!.span.startPosition &&
          w.position <= ctx.instance!.span.endPosition,
      )
      .map((w) => w.original);

    console.log(`  Span LP : ${spanWords.join(" ")}`);

    const targetWord =
      sentence.words.find((w) => ctx.instance!.triggeringTokens.includes(w.position)) ??
      sentence.words.find(
        (w) =>
          w.position >= ctx.instance!.span.startPosition &&
          w.position <= ctx.instance!.span.endPosition,
      );

    if (!targetWord) {
      continue;
    }

    const enc =
      pass === 1
        ? null
        : encounter(
            pass,
            Math.max(0, pass - 1),
            textId,
            text.title,
            sentence.id,
          );

    const decision = decidePedagogicalIntervention(
      buildOrchestratorInputFromReader({
        text,
        sentenceId: sentence.id,
        interaction: "explore_word",
        wordPosition: targetWord.position,
        encounter: enc,
        session: getOrchestratorSession(),
        isFirstReadOfText: pass === 1,
      }),
    );

    const view = mapDecisionToReaderExperience(decision, pattern, targetWord.original);

    console.log(`  Mot testé : ${targetWord.original}`);
    console.log(`  Décision : ${decision.action}`);
    if (view.visible) {
      console.log(`  Carte : ${view.title}`);
      for (const section of view.sections) {
        console.log(`    [${section.label}] ${section.content.slice(0, 120)}${section.content.length > 120 ? "…" : ""}`);
      }
    } else if (decision.softMessage) {
      console.log(`  Message : ${decision.softMessage}`);
    } else {
      console.log(`  (silence — traduction seule)`);
    }
  }
}

async function main() {
  for (const textId of PATH) {
    for (const pass of [1, 2, 4]) {
      await walkText(textId, pass);
    }
  }
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
