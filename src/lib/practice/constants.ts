export const PRACTICE_SUGGESTIONS = [
  { label: "Describe your morning", context: "Describe your morning routine" },
  { label: "Explain why you like coffee", context: "Explain why you like coffee" },
  { label: "Talk about yesterday", context: "Talk about what you did yesterday" },
  { label: "Express a future plan", context: "Express a plan for the near future" },
  { label: "Use: несмотря на", context: "Use the structure: несмотря на" },
] as const;

export function practicePath(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value?.trim()) {
      search.set(key, value.trim());
    }
  }
  const query = search.toString();
  return query ? `/practice?${query}` : "/practice";
}
