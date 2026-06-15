import { PdfImportError } from "./pdf-import-error";

type PdfJsModule = typeof import("pdfjs-dist");

let pdfJsPromise: Promise<PdfJsModule> | null = null;

async function loadPdfJs(): Promise<PdfJsModule> {
  if (!pdfJsPromise) {
    pdfJsPromise = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      return pdfjs;
    });
  }
  return pdfJsPromise;
}

export type PdfExtractionResult = {
  pages: string[];
  pageCount: number;
  method: "direct";
};

/**
 * Extracts selectable text from a PDF using PDF.js (no OCR).
 */
export async function extractPdfTextFromBuffer(data: ArrayBuffer): Promise<PdfExtractionResult> {
  const pdfjs = await loadPdfJs();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(data) });
  const pdf = await loadingTask.promise;
  const pages: string[] = [];
  let totalChars = 0;

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(pageText);
    totalChars += pageText.length;
  }

  const avgCharsPerPage = pdf.numPages > 0 ? totalChars / pdf.numPages : 0;

  if (totalChars < 40) {
    throw new PdfImportError(
      "no_selectable_text",
      "Ce PDF ne contient pas de texte sélectionnable. Il s'agit probablement d'un scan — l'OCR n'est pas encore pris en charge.",
    );
  }

  if (pdf.numPages >= 3 && avgCharsPerPage < 25) {
    throw new PdfImportError(
      "insufficient_text",
      "Très peu de texte extractible dans ce PDF. Vérifiez qu'il s'agit d'un document avec texte intégré, pas d'une image scannée.",
    );
  }

  return {
    pages,
    pageCount: pdf.numPages,
    method: "direct",
  };
}

/**
 * Node.js PDF extraction (bulk import) using PDF.js legacy build without a worker.
 */
export async function extractPdfTextFromBufferNode(
  data: Buffer | Uint8Array,
): Promise<PdfExtractionResult> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjs.getDocument({
    data: data instanceof Buffer ? new Uint8Array(data) : data,
    useSystemFonts: true,
    disableFontFace: true,
  });
  const pdf = await loadingTask.promise;
  const pages: string[] = [];
  let totalChars = 0;

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(pageText);
    totalChars += pageText.length;
  }

  const avgCharsPerPage = pdf.numPages > 0 ? totalChars / pdf.numPages : 0;

  if (totalChars < 40) {
    throw new PdfImportError(
      "no_selectable_text",
      "Ce PDF ne contient pas de texte sélectionnable.",
    );
  }

  if (pdf.numPages >= 3 && avgCharsPerPage < 25) {
    throw new PdfImportError(
      "insufficient_text",
      "Très peu de texte extractible dans ce PDF.",
    );
  }

  return {
    pages,
    pageCount: pdf.numPages,
    method: "direct",
  };
}
