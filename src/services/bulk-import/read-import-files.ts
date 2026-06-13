import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import type { CefrLevel } from "@/types/domain";

const TEXT_EXTENSIONS = new Set([".txt", ".md", ".text"]);

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

    const rawText = await readFile(fullPath, "utf8");
    if (!rawText.trim()) {
      continue;
    }

    const title =
      options.titleFromFilename !== false
        ? path.basename(entry, ext).replace(/[-_]/g, " ")
        : entry;

    files.push({
      fileName: entry,
      filePath: fullPath,
      title,
      rawText,
    });
  }

  return files.sort((a, b) => a.fileName.localeCompare(b.fileName, "fr"));
}
