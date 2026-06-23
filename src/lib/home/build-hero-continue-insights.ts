import type { ContinueReadingMeta } from "@/lib/home/resolve-continue-reading";
import type { TextReadingProgress } from "@/lib/reader/reading-progress";

export type HeroContinueInsights = {
  lastSession: string;
  estimatedRemainingMinutes: number;
  nextMilestone: string;
  wordsDiscovered: number;
};

function formatLastSession(lastReadAt: string | null): string {
  if (!lastReadAt) {
    return "Not started yet";
  }

  const readDate = new Date(lastReadAt);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfReadDay = new Date(readDate.getFullYear(), readDate.getMonth(), readDate.getDate());
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfReadDay.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (dayDiff === 0) {
    return "Today";
  }
  if (dayDiff === 1) {
    return "Yesterday";
  }
  if (dayDiff < 7) {
    return `${dayDiff} days ago`;
  }

  return readDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function buildHeroContinueInsights(
  meta: ContinueReadingMeta,
  textProgress: TextReadingProgress | null,
  wordsDiscovered: number,
): HeroContinueInsights {
  const percent = textProgress?.percent ?? 0;
  const remainingRatio = Math.max(0, 100 - percent) / 100;
  const estimatedRemainingMinutes = Math.max(1, Math.round(meta.estimatedMinutes * remainingRatio));

  return {
    lastSession: formatLastSession(textProgress?.lastReadAt ?? null),
    estimatedRemainingMinutes,
    nextMilestone: `Finish ${meta.collection}`,
    wordsDiscovered,
  };
}

export const WORDS_MILESTONE_GOAL = 100;

export function buildWordsMilestone(wordsDiscovered: number): {
  goal: number;
  current: number;
  remaining: number;
  percent: number;
} {
  const goal = WORDS_MILESTONE_GOAL;
  const current = Math.min(wordsDiscovered, goal);
  const remaining = Math.max(0, goal - wordsDiscovered);
  const percent = Math.min(100, Math.round((current / goal) * 100));

  return { goal, current, remaining, percent };
}
