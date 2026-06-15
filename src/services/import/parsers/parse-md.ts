import matter from "gray-matter";

import { normalizeImportDocument } from "./extract-import-metadata";
import type { NormalizedImportDocument } from "./types";

function stripMarkdown(raw: string): string {
  let text = raw;
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/\*([^*]+)\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/_([^_]+)_/g, "$1");
  text = text.replace(/`([^`]+)`/g, "$1");
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");
  text = text.replace(/^>\s+/gm, "");
  return text;
}

export function parseMd(raw: string, fileName: string): NormalizedImportDocument {
  const { content, data } = matter(raw);
  const stripped = stripMarkdown(content);
  const { text, metadata } = normalizeImportDocument(stripped, {
    sourceType: "md",
    fileName,
  });

  const titleFromFrontmatter =
    typeof data.title === "string" && data.title.trim().length > 0 ? data.title.trim() : null;
  const sourceFromFrontmatter =
    typeof data.source === "string" && data.source.trim().length > 0 ? data.source.trim() : "";

  return {
    rawText: text,
    title: titleFromFrontmatter ?? fileName.replace(/\.(md|markdown)$/i, "").replace(/[-_]/g, " "),
    source: sourceFromFrontmatter,
    metadata,
    sourceType: "md",
  };
}
