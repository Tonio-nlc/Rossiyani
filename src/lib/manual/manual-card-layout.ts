/** Split French / Russian lesson titles for editorial card layout. */
export function formatManualCardTitle(title: string): {
  primary: string;
  secondary: string | null;
} {
  const colonParts = title.split(/\s*:\s*/);
  if (colonParts.length >= 2) {
    const primary = colonParts[0]!.trim();
    const rest = colonParts.slice(1).join(": ").trim();
    if (/[\u0400-\u04FF]/.test(rest)) {
      return {
        primary,
        secondary: rest.replace(/\s*\/\s*/g, " · ").replace(/,\s*/g, " · "),
      };
    }
  }

  const dotParts = title.split(/\s·\s*/);
  if (dotParts.length >= 2 && /[\u0400-\u04FF]/.test(dotParts[1]!)) {
    return {
      primary: dotParts[0]!.trim(),
      secondary: dotParts
        .slice(1)
        .join(" · ")
        .trim()
        .replace(/\s*\/\s*/g, " · "),
    };
  }

  return { primary: title.trim(), secondary: null };
}
