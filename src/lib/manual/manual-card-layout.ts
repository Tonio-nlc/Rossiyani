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

export const manualLessonGridClass =
  "grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 min-[1600px]:grid-cols-4 min-[1920px]:grid-cols-5";

export const manualBrowseGridClass =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 min-[1600px]:grid-cols-5 min-[1920px]:grid-cols-6";

export const manualLevelGridClass =
  "grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-6";

export const manualCategoryLandingGridClass =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 min-[1600px]:grid-cols-5";

const browseCardClass =
  "focus-kb group block rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] px-4 py-3 transition duration-200 hover:border-[var(--ink-muted)] hover:shadow-[0_2px_14px_rgba(0,0,0,0.05)]";

export { browseCardClass };
