#!/usr/bin/env tsx
/**
 * Validate PatternInstance coverage for Foundation Pack texts.
 * Usage: npx tsx scripts/validate-a1-foundation-pack.ts
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "../src/lib/prisma";
import { loadReaderPatternSlice } from "../src/features/reader/load-reader-pattern-slice";

const MANIFEST = path.join(process.cwd(), "content", "a1-foundation-pack", "manifest.json");

type TextSpec = {
  id: string;
  slug?: string;
  introduces?: string[];
};

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST, "utf8")) as {
    order: string[];
    texts: TextSpec[];
  };

  const specById = new Map(manifest.texts.map((t) => [t.id, t]));
  const rows: Array<{
    id: string;
    imported: boolean;
    sentences: number;
    withPrimary: number;
    instances: number;
    patterns: string[];
    expectedIntro?: string[];
    gap?: string;
  }> = [];

  for (const slug of manifest.order) {
    const spec =
      manifest.texts.find((t) => t.slug === slug) ??
      manifest.texts.find((t) => slug.includes(t.id.replace("text-a1-", "").replace(/-01$/, "")));
    const textId = spec?.id ?? slug;

    const text = await prisma.text.findUnique({
      where: { id: textId },
      include: { _count: { select: { sentences: true } } },
    });

    if (!text) {
      rows.push({
        id: textId,
        imported: false,
        sentences: 0,
        withPrimary: 0,
        instances: 0,
        patterns: [],
        expectedIntro: spec?.introduces,
        gap: "Texte non importé",
      });
      continue;
    }

    const instanceCount = await prisma.patternInstance.count({ where: { textId } });
    const withPrimary = await prisma.sentence.count({
      where: { textId, primaryPatternId: { not: null } },
    });
    const slice = await loadReaderPatternSlice(textId);
    const patternIds = [...new Set(Object.keys(slice.patterns))];

    rows.push({
      id: textId,
      imported: true,
      sentences: text._count.sentences,
      withPrimary,
      instances: instanceCount,
      patterns: patternIds,
      expectedIntro: spec?.introduces,
      gap:
        withPrimary === 0
          ? "Aucun LP primaire indexé"
          : spec?.introduces?.length && !spec.introduces.some((p) => patternIds.includes(p))
            ? "LP d'intro non détecté"
            : undefined,
    });
  }

  console.log("\nFoundation Pack A1 — validation PatternInstance\n");
  console.table(rows);

  const missing = rows.filter((r) => r.gap);
  if (missing.length > 0) {
    console.log(`\n⚠  ${missing.length} texte(s) avec lacune(s)`);
    process.exitCode = 1;
  } else {
    console.log("\n✓  Tous les textes importés ont des PatternInstance");
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
