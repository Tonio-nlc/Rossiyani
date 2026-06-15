/**
 * Normalizes curly/smart quotes and Cyrillic quote variants to consistent forms.
 */
export function normalizeQuotes(text: string): string {
  return text
    .replace(/[\u2018\u2019\u02BC\u0060]/g, "'")
    .replace(/[\u201C\u201D\u201E\u00AB\u00BB\u2039\u203A]/g, (match) => {
      if (match === "\u00AB" || match === "\u2039") {
        return "«";
      }
      if (match === "\u00BB" || match === "\u203A") {
        return "»";
      }
      return '"';
    })
    .replace(/''/g, '"');
}
