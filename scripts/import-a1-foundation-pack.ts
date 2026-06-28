#!/usr/bin/env tsx
/**
 * Import Foundation Pack A1 texts in reading order.
 * Usage: set -a && source .env && set +a && npx tsx scripts/import-a1-foundation-pack.ts [--dry-run] [--only id1,id2]
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

import { importRussianTextFeature } from "../src/features/import";
import { parseMd } from "../src/services/import/parsers/parse-md";
import { prisma } from "../src/lib/prisma";
import type { CefrLevel } from "../src/types/domain";

const PACK_DIR = path.join(process.cwd(), "content", "a1-foundation-pack");

type PackManifest = {
  order: string[];
};

async function loadManifest(): Promise<string[]> {
  const manifestPath = path.join(PACK_DIR, "manifest.json");
  try {
    const raw = await readFile(manifestPath, "utf8");
    const manifest = JSON.parse(raw) as PackManifest;
    if (manifest.order?.length) {
      return manifest.order;
    }
  } catch {
    // fall through
  }

  const files = (await readdir(PACK_DIR)).filter((name) => name.endsWith(".md")).sort();
  return files.map((name) => name.replace(/\.md$/, ""));
}

async function importOne(slug: string, dryRun: boolean) {
  const filePath = path.join(PACK_DIR, `${slug}.md`);
  const raw = await readFile(filePath, "utf8");
  const { data } = matter(raw);
  const parsed = parseMd(raw, `${slug}.md`);

  const textId = typeof data.id === "string" ? data.id : parsed.textId;
  const level = (parsed.level ?? data.level ?? "A1") as CefrLevel;
  const collectionId = parsed.collectionId ?? data.collectionId;

  if (!textId) {
    throw new Error(`${slug}: frontmatter "id" is required`);
  }

  const existing = await prisma.text.findUnique({ where: { id: textId } });
  if (existing) {
    console.log(`⏭  ${textId} — déjà importé (${existing.title})`);
    return { textId, skipped: true };
  }

  if (dryRun) {
    console.log(`✓  [dry-run] ${textId} — ${parsed.title} (${parsed.rawText.length} chars)`);
    return { textId, skipped: false };
  }

  console.log(`→  Import ${textId} — ${parsed.title}…`);
  const result = await importRussianTextFeature(
    {
      textId,
      title: parsed.title,
      level,
      collectionId: typeof collectionId === "string" ? collectionId : undefined,
      rawText: parsed.rawText,
    },
    { skipDuplicates: false },
  );

  console.log(
    `✓  ${textId} — ${result.sentenceCount} phrases, ${result.wordCount} mots, patterns via pipeline`,
  );
  return { textId, skipped: result.skippedDuplicate ?? false, result };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const onlyFlag = args.find((a) => a.startsWith("--only="));
  const only = onlyFlag
    ? new Set(onlyFlag.replace("--only=", "").split(",").map((s) => s.trim()))
    : null;

  const order = await loadManifest();
  const slugs = only ? order.filter((slug) => only.has(slug) || [...only].some((id) => slug.includes(id))) : order;

  console.log(`Foundation Pack A1 — ${slugs.length} texte(s)${dryRun ? " (dry-run)" : ""}\n`);

  for (const slug of slugs) {
    try {
      await importOne(slug, dryRun);
    } catch (error) {
      console.error(`✗  ${slug}:`, error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
