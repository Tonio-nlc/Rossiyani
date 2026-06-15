import { normalizeImportDocument } from "./extract-import-metadata";
import type { NormalizedImportDocument } from "./types";

export function parseTxt(raw: string, fileName: string): NormalizedImportDocument {
  const { text, metadata } = normalizeImportDocument(raw, {
    sourceType: "txt",
    fileName,
  });

  return {
    rawText: text,
    title: fileName.replace(/\.(txt|text)$/i, "").replace(/[-_]/g, " "),
    source: "",
    metadata,
    sourceType: "txt",
  };
}
