import { detectSourceType } from "./detect-source-type";
import { parseMd } from "./parse-md";
import { parsePdf } from "./parse-pdf";
import { parseTxt } from "./parse-txt";
import { PdfImportError } from "./pdf-import-error";
import type { NormalizedImportDocument, ParseImportSourceOptions } from "./types";

export type ReadImportSourceInput = ParseImportSourceOptions & {
  rawText?: string;
  arrayBuffer?: ArrayBuffer;
  mimeType?: string;
};

/**
 * Routes an import source through parseTxt / parseMd / parsePdf, then normalize().
 */
export async function readImportSource(input: ReadImportSourceInput): Promise<NormalizedImportDocument> {
  const sourceType = detectSourceType(input.fileName, input.mimeType);
  input.onProgress?.("uploading");

  try {
    if (sourceType === "pdf") {
      if (!input.arrayBuffer) {
        throw new PdfImportError("missing_data", "Ce PDF n'a pas pu être traité — fichier illisible.");
      }
      return await parsePdf(input.arrayBuffer, input.fileName, input.onProgress);
    }

    const raw = input.rawText ?? "";
    if (!raw.trim()) {
      throw new Error("Fichier vide.");
    }

    input.onProgress?.("generating");

    const document =
      sourceType === "md" ? parseMd(raw, input.fileName) : parseTxt(raw, input.fileName);

    input.onProgress?.("done");
    return document;
  } catch (error) {
    if (error instanceof PdfImportError) {
      throw error;
    }
    if (sourceType === "pdf") {
      throw new PdfImportError(
        "unknown",
        "Ce PDF n'a pas pu être traité.",
      );
    }
    throw error;
  }
}

export type { ImportParsePhase, NormalizedImportDocument, ImportSourceType } from "./types";

/** @deprecated Use readImportSource — kept for architecture naming. */
export const ReaderGenerator = readImportSource;

export { parseTxt, parseMd, parsePdf };
export { extractPdfTextFromBuffer, extractPdfTextFromBufferNode } from "./extract-pdf-text";
export { normalizeImportDocument, normalize } from "./extract-import-metadata";
export { PdfImportError, isPdfImportError } from "./pdf-import-error";
