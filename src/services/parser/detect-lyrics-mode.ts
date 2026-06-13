/**
 * Detects lyrics / poetry / rap layout (many short lines).
 */
export function detectLyricsMode(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) {
    return false;
  }

  const lines = trimmed.split(/\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 4) {
    return false;
  }

  const avgLineLength = trimmed.length / lines.length;
  const shortLineRatio = lines.filter((line) => line.length <= 120).length / lines.length;

  return avgLineLength <= 90 && shortLineRatio >= 0.75;
}

/** One segment per non-empty line (verse / bar). */
export function segmentLyricsLines(text: string): string[] {
  return text
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
