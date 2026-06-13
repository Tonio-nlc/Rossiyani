/**
 * Limits prose to a maximum number of sentences for learner-facing panels.
 */
export function clampToSentences(text: string, maxSentences: number): {
  text: string;
  truncated: boolean;
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return { text: "", truncated: false };
  }

  const parts = trimmed.split(/(?<=[.!?…])\s+/).filter(Boolean);
  if (parts.length <= maxSentences) {
    return { text: trimmed, truncated: false };
  }

  return {
    text: parts.slice(0, maxSentences).join(" "),
    truncated: true,
  };
}
