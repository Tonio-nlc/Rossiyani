/**
 * One-shot import script for local verification.
 * Usage: set -a && source .env && set +a && npx tsx scripts/rerun-import.ts
 */
import { importRussianTextFeature } from "../src/features/import";

async function main() {
  const result = await importRussianTextFeature({
    title: "Таяла зима",
    level: "A2",
    rawText: "Таяла зима в нашем городке.",
  });

  console.log("Import success:", JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("Import failed:", error);
  process.exit(1);
});
