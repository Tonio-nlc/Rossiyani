import type { ImportSourceType } from "./types";

const PDF_MIME = new Set(["application/pdf", "application/x-pdf"]);
const MD_MIME = new Set(["text/markdown", "text/x-markdown"]);

export function detectSourceType(fileName: string, mimeType?: string): ImportSourceType {
  const ext = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")).toLowerCase() : "";
  const mime = mimeType?.toLowerCase() ?? "";

  if (ext === ".pdf" || PDF_MIME.has(mime)) {
    return "pdf";
  }
  if (ext === ".md" || ext === ".markdown" || MD_MIME.has(mime)) {
    return "md";
  }
  return "txt";
}
