import type { ExplorationEntry } from "@/lib/explorer/exploration-history";
import { countLearnableWordsSeen } from "@/lib/linguistics/lexical-metadata";
import {
  getAllReadingProgress,
  type TextReadingProgress,
} from "@/lib/reader/reading-progress";

export type LearningStreakSnapshot = {
  currentStreak: number;
  weeklyActivity: boolean[];
  wordsToday: number;
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayKey(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

function collectActiveDayKeys(
  progressEntries: TextReadingProgress[],
  explorationEntries: ExplorationEntry[],
): Set<string> {
  const keys = new Set<string>();

  for (const entry of progressEntries) {
    keys.add(dayKey(new Date(entry.lastReadAt)));
  }

  for (const entry of explorationEntries) {
    keys.add(dayKey(new Date(entry.visitedAt)));
  }

  return keys;
}

function computeStreak(activeDays: Set<string>): number {
  const today = startOfDay(new Date());
  let streak = 0;

  for (let offset = 0; offset < 365; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    if (activeDays.has(dayKey(date))) {
      streak += 1;
    } else if (offset > 0) {
      break;
    }
  }

  return streak;
}

function computeWeeklyActivity(activeDays: Set<string>): boolean[] {
  const today = startOfDay(new Date());
  const week: boolean[] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    week.push(activeDays.has(dayKey(date)));
  }

  return week;
}

function countWordsSeenToday(progressEntries: TextReadingProgress[]): number {
  const todayKey = dayKey(new Date());
  let total = 0;

  for (const entry of progressEntries) {
    if (dayKey(new Date(entry.lastReadAt)) === todayKey) {
      total += countLearnableWordsSeen(entry);
    }
  }

  return total;
}

export function getLearningStreakSnapshot(
  explorationEntries: ExplorationEntry[],
): LearningStreakSnapshot {
  const progressEntries = Object.values(getAllReadingProgress());
  const activeDays = collectActiveDayKeys(progressEntries, explorationEntries);

  return {
    currentStreak: computeStreak(activeDays),
    weeklyActivity: computeWeeklyActivity(activeDays),
    wordsToday: countWordsSeenToday(progressEntries),
  };
}

export type ActivityTimelineGroup = {
  label: string;
  items: Array<{ prefix: string; value: string; href: string }>;
};

function groupLabel(date: Date, now: Date): string {
  const diffDays = Math.round(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) / (24 * 60 * 60 * 1000),
  );

  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function activityPrefix(kind: ExplorationEntry["kind"]): string {
  switch (kind) {
    case "lemma":
      return "Learned";
    case "phrase":
      return "New expression";
    case "text":
      return "Opened";
    case "concept":
      return "Grammar";
    case "case":
      return "Grammar";
    case "ending":
      return "Morphology";
    default:
      return "Visited";
  }
}

export function buildActivityTimeline(
  entries: ExplorationEntry[],
  limit = 8,
): ActivityTimelineGroup[] {
  const now = new Date();
  const groups = new Map<string, ActivityTimelineGroup>();

  for (const entry of entries.slice(0, limit)) {
    const label = groupLabel(new Date(entry.visitedAt), now);
    const group = groups.get(label) ?? { label, items: [] };
    group.items.push({
      prefix: activityPrefix(entry.kind),
      value: entry.label,
      href: entry.href,
    });
    groups.set(label, group);
  }

  return [...groups.values()];
}
