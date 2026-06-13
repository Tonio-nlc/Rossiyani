import { createHash } from "node:crypto";

import { cleanText } from "@/services/parser";

/**
 * Stable SHA-256 hash of normalized Russian text for duplicate detection.
 * Uses the same cleanText() as the import pipeline.
 */
export function computeContentHash(rawText: string): string {
  const normalized = cleanText(rawText).replace(/\s+/g, " ").trim().toLocaleLowerCase("ru-RU");
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}
