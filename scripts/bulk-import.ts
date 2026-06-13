#!/usr/bin/env tsx
/**
 * CLI bulk import: tsx scripts/bulk-import.ts <folder> [--name JobName] [--level B1]
 */
import path from "node:path";

import { enqueueBulkImport, runBulkImportJob } from "../src/features/bulk-import";
import type { CefrLevel } from "../src/types/domain";

async function main() {
  const args = process.argv.slice(2);
  const folderPath = args.find((a) => !a.startsWith("--"));
  if (!folderPath) {
    console.error("Usage: tsx scripts/bulk-import.ts <folder> [--name JobName] [--level B1]");
    process.exit(1);
  }

  const nameFlag = args.indexOf("--name");
  const levelFlag = args.indexOf("--level");
  const jobName =
    nameFlag >= 0 ? args[nameFlag + 1] : `Bulk ${path.basename(folderPath)}`;
  const level = (levelFlag >= 0 ? args[levelFlag + 1] : "B1") as CefrLevel;

  const job = await enqueueBulkImport({
    jobName: jobName ?? "Bulk import",
    folderPath: path.resolve(folderPath),
    level,
  });

  console.log(`Job créé: ${job.id} (${job.totalFiles} fichiers)`);

  const progress = await runBulkImportJob(job.id);
  console.log(JSON.stringify(progress, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
