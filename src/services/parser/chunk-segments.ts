export const SEGMENT_MAX_LENGTH = 350;
export const SEGMENT_TARGET_LENGTH = 250;

/**
 * Splits segments that exceed max length using natural break points.
 */
export function chunkSegments(
  segments: string[],
  maxLength = SEGMENT_MAX_LENGTH,
  targetLength = SEGMENT_TARGET_LENGTH,
): string[] {
  const result: string[] = [];

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) {
      continue;
    }
    if (trimmed.length <= maxLength) {
      result.push(trimmed);
      continue;
    }
    result.push(...splitLongSegment(trimmed, maxLength, targetLength));
  }

  return result;
}

function splitLongSegment(text: string, maxLength: number, targetLength: number): string[] {
  const parts: string[] = [];
  let remaining = text;

  while (remaining.length > maxLength) {
    const sliceEnd = findSplitIndex(remaining, targetLength, maxLength);
    const chunk = remaining.slice(0, sliceEnd).trim();
    if (chunk) {
      parts.push(chunk);
    }
    remaining = remaining.slice(sliceEnd).trim();
  }

  if (remaining) {
    parts.push(remaining);
  }

  return parts.length > 0 ? parts : [text];
}

function findSplitIndex(text: string, targetLength: number, maxLength: number): number {
  const searchWindow = text.slice(0, maxLength);
  const breakChars = [". ", "! ", "? ", "… ", "; ", ", ", " — ", " - ", "\n", " "];

  for (const delimiter of breakChars) {
    const idx = searchWindow.lastIndexOf(delimiter, targetLength + delimiter.length);
    if (idx > Math.floor(targetLength * 0.4)) {
      return idx + delimiter.length;
    }
  }

  const spaceIdx = searchWindow.lastIndexOf(" ", targetLength);
  if (spaceIdx > 40) {
    return spaceIdx + 1;
  }

  return maxLength;
}
