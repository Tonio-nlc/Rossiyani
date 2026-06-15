import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import {
  extractPdfTextFromBufferNode,
  normalizeImportDocument,
  parseMd,
  parseTxt,
  PdfImportError,
} from "@/services/import/parsers";
import type { CefrLevel } from "@/types/domain";

const TEXT_EXTENSIONS = new Set([".txt", ".md", ".text", ".pdf"]);

export type ImportFileDescriptor = {
  fileName: string;
  filePath: string;
  title: string;
  rawText: string;
};

export type ReadImportFolderOptions = {
  level: CefrLevel;
  source?: string;
  /** Derive title from filename when true (default). */
  titleFromFilename?: boolean;
};

async function readImportFileFromDisk(
  entry: string,
  fullPath: string,
  options: ReadImportFolderOptions,
): Promise<ImportFileDescriptor | null> {
  const ext = path.extname(entry).toLowerCase();

  if (ext === ".pdf") {
    try {
      const buffer = await readFile(fullPath);
      const extraction = await extractPdfTextFromBufferNode(buffer);
      const { text } = normalizeImportDocument(extraction.pages.join("\n\n"), {
        sourceType: "pdf",
        fileName: entry,
        pdfPages: extraction.pages,
      });
      if (!text.trim()) {
        return null;
      }
      return {
        fileName: entry,
        filePath: fullPath,
        title:
          options.titleFromFilename !== false
            ? path.basename(entry, ext).replace(/[-_]/g, " ")
            : entry,
        rawText: text,
      };
    } catch (error) {
      if (error instanceof PdfImportError) {
        console.warn(`Skipping PDF ${entry}: ${error.reason}`);
        return null;
      }
      throw error;
    }
  }

  const rawText = await readFile(fullPath, "utf8");
  if (!rawText.trim()) {
    return null;
  }

  const document =
    ext === ".md" || ext === ".markdown"
      ? parseMd(rawText, entry)
      : parseTxt(rawText, entry);

  return {
    fileName: entry,
    filePath: fullPath,
    title:
      options.titleFromFilename !== false
        ? document.title
        : entry,
    rawText: document.rawText,
  };
}

/**
 * Reads all text files from a folder (non-recursive by default).
 */
export async function readImportFolder(
  folderPath: string,
  options: ReadImportFolderOptions,
  recursive = false,
): Promise<ImportFileDescriptor[]> {
  const entries = await readdir(folderPath);
  const files: ImportFileDescriptor[] = [];

  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry);
    const info = await stat(fullPath);

    if (info.isDirectory() && recursive) {
      const nested = await readImportFolder(fullPath, options, true);
      files.push(...nested);
      continue;
    }

    if (!info.isFile()) {
      continue;
    }

    const ext = path.extname(entry).toLowerCase();
    if (!TEXT_EXTENSIONS.has(ext)) {
      continue;
    }

    const descriptor = await readImportFileFromDisk(entry, fullPath, options);
    if (descriptor) {
      files.push(descriptor);
    }
  }

  return files.sort((a, b) => a.fileName.localeCompare(b.fileName, "fr"));
}
