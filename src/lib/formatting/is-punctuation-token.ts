/** True when the token is punctuation-only (not a linguistic word). */
export function isPunctuationToken(original: string): boolean {
  if (!original.trim()) {
    return true;
  }
  return /^[^\p{L}\p{N}]+$/u.test(original);
}
