/** Segments that must never trigger AI, storage, or graph writes. */
const MEANINGLESS_ONLY_PATTERN =
  /^[\s"'""''«»„‚‛…•—–\-.,!?:;()[\]{}«»]+$/u;

/**
 * Returns false for whitespace-only, punctuation-only, or decorative segments
 * (quotes, ellipsis, bullets, em-dashes, etc.).
 */
export function isMeaningfulSentence(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) {
    return false;
  }

  if (MEANINGLESS_ONLY_PATTERN.test(trimmed)) {
    return false;
  }

  const withoutSeparators = trimmed.replace(
    /[\s"'""''«»„‚‛…•—–\-.,!?:;()[\]{}«»]+/gu,
    "",
  );
  return withoutSeparators.length > 0;
}
