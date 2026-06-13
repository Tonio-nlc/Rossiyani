#!/usr/bin/env tsx
/**
 * CLI knowledge backfill: tsx scripts/backfill-knowledge.ts [--dry-run]
 */
import { runKnowledgeBackfill } from "../src/features/backfill";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(dryRun ? "Dry run — aucune écriture" : "Backfill en cours…");

  const report = await runKnowledgeBackfill({ dryRun });
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
