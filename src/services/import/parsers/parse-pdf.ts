import { normalizeImportDocument } from "./extract-import-metadata";
import { extractPdfTextFromBuffer } from "./extract-pdf-text";
import { PdfImportError } from "./pdf-import-error";
import type { ImportParsePhase, NormalizedImportDocument } from "./types";

export async function parsePdf(
  data: ArrayBuffer,
  fileName: string,
  onProgress?: (phase: ImportParsePhase) => void,
): Promise<NormalizedImportDocument> {
  onProgress?.("extracting");

  let extraction;
  try {
    extraction = await extractPdfTextFromBuffer(data);
  } catch (error) {
    if (error instanceof PdfImportError) {
      throw error;
    }
    throw new PdfImportError(
      "extraction_failed",
      "Ce PDF n'a pas pu être traité — erreur lors de l'extraction du texte.",
    );
  }

  onProgress?.("generating");

  const { text, metadata } = normalizeImportDocument(extraction.pages.join("\n\n"), {
    sourceType: "pdf",
    fileName,
    pdfPages: extraction.pages,
  });

  if (!text.trim()) {
    throw new PdfImportError(
      "empty_after_cleaning",
      "Ce PDF n'a pas pu être traité — aucun texte utilisable après nettoyage.",
    );
  }

  if (metadata.estimatedSentences === 0) {
    throw new PdfImportError(
      "no_sentences",
      "Ce PDF n'a pas pu être traité — aucune phrase détectée dans le texte extrait.",
    );
  }

  onProgress?.("done");

  return {
    rawText: text,
    title: fileName.replace(/\.pdf$/i, "").replace(/[-_]/g, " "),
    source: "",
    metadata,
    extractionMethod: extraction.method,
    sourceType: "pdf",
  };
}
