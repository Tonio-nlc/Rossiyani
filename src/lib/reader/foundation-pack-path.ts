/** Foundation Pack A1 — reading order (first session = texts 1–3). */
export const A1_FOUNDATION_READING_PATH = [
  "text-a1-intro-01",
  "text-a1-family-01",
  "text-a1-home-01",
  "text-a1-cafe-01",
  "text-a1-day-01",
  "text-a1-metro-01",
  "text-a1-shop-01",
  "text-a1-describe-01",
  "text-a1-school-01",
  "text-a1-weather-01",
  "text-a1-friend-01",
  "text-a1-city-01",
  "text-a1-evening-01",
  "text-a1-breakfast-01",
  "text-a1-phone-01",
  "text-a1-park-01",
  "text-a1-colors-01",
  "text-a1-market-01",
  "text-a1-weekend-01",
  "text-a1-dialogue-01",
  "text-a1-bridge-01",
  "text-a1-capstone-01",
] as const;

export const A1_FIRST_SESSION_TEXT_IDS: readonly string[] = [
  "text-a1-intro-01",
  "text-a1-family-01",
  "text-a1-home-01",
];

/** Editorial primary LP per text (first three texts — First Aha sprint). */
export const A1_EDITORIAL_PRIMARY_PATTERN: Record<string, string> = {
  "text-a1-intro-01": "lp.verbs.present_conjugation.v1",
  "text-a1-family-01": "lp.morphology.role_terminations.v1",
  "text-a1-home-01": "lp.syntax.possession_existence.v1",
};

/** Sentence-position overrides (0-based) when the default text LP is not enough. */
export const A1_EDITORIAL_PRIMARY_BY_SENTENCE: Record<string, Record<number, string>> = {
  "text-a1-home-01": {
    0: "lp.syntax.possession_existence.v1",
    1: "lp.syntax.possession_existence.v1",
  },
};

export function resolveEditorialPrimaryPatternId(
  textId: string,
  sentencePosition?: number,
): string | undefined {
  if (sentencePosition !== undefined) {
    const bySentence = A1_EDITORIAL_PRIMARY_BY_SENTENCE[textId]?.[sentencePosition];
    if (bySentence) {
      return bySentence;
    }
  }
  return A1_EDITORIAL_PRIMARY_PATTERN[textId];
}

export function getNextFoundationTextId(currentTextId: string): string | null {
  const index = A1_FOUNDATION_READING_PATH.indexOf(
    currentTextId as (typeof A1_FOUNDATION_READING_PATH)[number],
  );
  if (index < 0 || index >= A1_FOUNDATION_READING_PATH.length - 1) {
    return null;
  }
  return A1_FOUNDATION_READING_PATH[index + 1] ?? null;
}

export function isFirstSessionTextId(textId: string): boolean {
  return A1_FIRST_SESSION_TEXT_IDS.includes(textId);
}
