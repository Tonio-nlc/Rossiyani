import type { TextListItem } from "@/features/texts";

const BLOCKED_TITLE_PATTERNS = [/test post-prod/i, /^test\s+/i, /^untitled$/i];

export function isDisplayableLibraryText(text: TextListItem): boolean {
  const title = text.title.trim();
  if (title.length === 0) {
    return false;
  }
  return !BLOCKED_TITLE_PATTERNS.some((pattern) => pattern.test(title));
}

export function displayableTextSource(source: string | null | undefined): string | null {
  if (!source) {
    return null;
  }
  const trimmed = source.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const lower = trimmed.toLowerCase();
  if (lower === "author unknown" || lower === "unknown") {
    return null;
  }
  return trimmed;
}
