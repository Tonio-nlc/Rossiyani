const PAGE_NUMBER = /^(?:page\s*)?\d{1,4}$/i;
const DASH_PAGE = /^-\s*\d{1,4}\s*-$/;
const SEPARATOR = /^[-–—_=]{4,}$/;
const STANDALONE_URL = /^https?:\/\/[^\s]+$/i;
const LESSON_HEADER = /^(?:lesson|урок|leçon|chapter|глава)\s+\d+/i;

function normalizeLine(line: string): string {
  return line.trim().replace(/\s+/g, " ").toLowerCase();
}

function isArtifactLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) {
    return false;
  }
  return (
    PAGE_NUMBER.test(trimmed) ||
    DASH_PAGE.test(trimmed) ||
    SEPARATOR.test(trimmed) ||
    STANDALONE_URL.test(trimmed)
  );
}

/**
 * Removes repeated headers/footers and per-page noise from PDF page texts.
 */
export function removePdfArtifacts(pages: string[]): string {
  if (pages.length === 0) {
    return "";
  }

  const lineCounts = new Map<string, number>();
  for (const page of pages) {
    const seenOnPage = new Set<string>();
    for (const line of page.split("\n")) {
      const key = normalizeLine(line);
      if (!key || key.length < 3) {
        continue;
      }
      if (seenOnPage.has(key)) {
        continue;
      }
      seenOnPage.add(key);
      lineCounts.set(key, (lineCounts.get(key) ?? 0) + 1);
    }
  }

  const repeatThreshold = Math.max(2, Math.ceil(pages.length * 0.5));
  const repeatedLines = new Set<string>();
  for (const [line, count] of lineCounts) {
    if (count >= repeatThreshold) {
      repeatedLines.add(line);
    }
  }

  const cleanedPages = pages.map((page) =>
    page
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return true;
        }
        if (isArtifactLine(trimmed)) {
          return false;
        }
        if (LESSON_HEADER.test(trimmed) && pages.length > 2) {
          const key = normalizeLine(trimmed);
          if (repeatedLines.has(key)) {
            return false;
          }
        }
        const key = normalizeLine(trimmed);
        return !repeatedLines.has(key);
      })
      .join("\n")
      .trim(),
  );

  return cleanedPages.filter(Boolean).join("\n\n");
}

/**
 * Cleans artifact patterns from already-merged plain text (non-page-aware).
 */
export function removeInlinePdfArtifacts(text: string): string {
  return text
    .split("\n")
    .filter((line) => !isArtifactLine(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
