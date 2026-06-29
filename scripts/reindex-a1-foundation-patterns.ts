#!/usr/bin/env tsx
/**
 * Re-run Pattern Instance Indexer on Foundation Pack texts (after analysis exists).
 * Usage: npx tsx scripts/reindex-a1-foundation-patterns.ts
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "../src/lib/prisma";
import { getPatternCatalogService } from "../src/services/patterns";
import {
  indexPatternInstances,
  persistPatternInstances,
  resolveIndexerKnowledgeContext,
} from "../src/services/patterns/indexer";
import type { SentenceAnalysisOutput } from "../src/services/ai/schemas";

const MANIFEST = path.join(process.cwd(), "content", "a1-foundation-pack", "manifest.json");

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST, "utf8")) as {
    texts: Array<{ id: string }>;
  };
  const catalog = await getPatternCatalogService();
  let totalInstances = 0;

  for (const { id: textId } of manifest.texts) {
    const sentences = await prisma.sentence.findMany({
      where: { textId },
      select: {
        id: true,
        russianText: true,
        analysisJson: true,
        words: { select: { id: true, position: true, original: true }, orderBy: { position: "asc" } },
      },
      orderBy: { position: "asc" },
    });

    if (sentences.length === 0) {
      console.log(`⏭  ${textId} — pas de phrases`);
      continue;
    }

    let textInstances = 0;
    for (let sentencePosition = 0; sentencePosition < sentences.length; sentencePosition++) {
      const sentence = sentences[sentencePosition]!;
      if (!sentence.analysisJson) {
        continue;
      }

      const analysis = JSON.parse(sentence.analysisJson) as SentenceAnalysisOutput;
      const storage = {
        sentenceId: sentence.id,
        wordIds: sentence.words.map((word) => ({
          id: word.id,
          position: word.position,
          original: word.original,
          formId: null,
        })),
        phraseGroupCount: 0,
      };

      const knowledgeContext = await resolveIndexerKnowledgeContext(analysis, storage);
      const index = indexPatternInstances({
        sentenceId: sentence.id,
        textId,
        sentencePosition,
        analysis,
        catalog,
        knowledgeContext,
      });

      await persistPatternInstances(index);
      textInstances += index.instances.length;
    }

    totalInstances += textInstances;
    const withPrimary = await prisma.sentence.count({
      where: { textId, primaryPatternId: { not: null } },
    });
    console.log(
      `✓  ${textId} — ${textInstances} instances, ${withPrimary}/${sentences.length} phrases primaires`,
    );
  }

  console.log(`\nTotal PatternInstance: ${totalInstances}`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
