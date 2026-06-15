const CONTINUATION_END = /[,;:—–-]$/;
const LOWER_START = /^[a-zа-яё]/;
const HYPHEN_BREAK = /-\s*$/;

/**
 * Merges PDF line breaks inside sentences, e.g. "Привет,\nкак дела?" → "Привет, как дела?"
 */
export function mergeBrokenLines(text: string): string {
  const lines = text.split("\n");
  const merged: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    let current = lines[index] ?? "";

    while (index + 1 < lines.length) {
      const next = lines[index + 1]?.trim() ?? "";
      if (!next) {
        break;
      }

      const currentTrimmed = current.trimEnd();
      const shouldMergeHyphen =
        HYPHEN_BREAK.test(currentTrimmed) && LOWER_START.test(next);
      const shouldMergeContinuation =
        CONTINUATION_END.test(currentTrimmed) && LOWER_START.test(next);

      if (!shouldMergeHyphen && !shouldMergeContinuation) {
        break;
      }

      if (shouldMergeHyphen) {
        current = `${currentTrimmed.replace(HYPHEN_BREAK, "")}${next}`;
      } else {
        current = `${currentTrimmed} ${next}`;
      }
      index += 1;
    }

    merged.push(current);
  }

  return merged.join("\n");
}
