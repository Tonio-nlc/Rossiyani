import type { ExplorationEntry } from "@/lib/explorer/exploration-history";
import { countLearnableWordsSeen } from "@/lib/linguistics/lexical-metadata";
import type { LearningStreakSnapshot } from "@/lib/home/learning-streak";
import type { SavedReaderWord } from "@/lib/reader/saved-words";
import type { TextReadingProgress } from "@/lib/reader/reading-progress";

export type HomeDashboardMetrics = {
  wordsExplored: number;
  textsCompleted: number;
  conceptsExplored: number;
  currentStreak: number;
  isReturning: boolean;
};

export function buildHomeDashboardMetrics(input: {
  readingProgress: Record<string, TextReadingProgress>;
  exploration: ExplorationEntry[];
  savedWords: SavedReaderWord[];
  streak: LearningStreakSnapshot;
}): HomeDashboardMetrics {
  const progressEntries = Object.values(input.readingProgress);
  const textsCompleted = progressEntries.filter((entry) => entry.percent >= 100).length;

  const wordsExplored = progressEntries.reduce(
    (total, entry) => total + countLearnableWordsSeen(entry),
    0,
  );

  const conceptsExplored = new Set(
    input.exploration
      .filter((entry) => entry.kind === "concept" || entry.kind === "case" || entry.kind === "ending")
      .map((entry) => entry.label.trim().toLowerCase()),
  ).size;

  const isReturning =
    progressEntries.length > 0 ||
    input.exploration.length > 0 ||
    input.savedWords.length > 0;

  return {
    wordsExplored,
    textsCompleted,
    conceptsExplored,
    currentStreak: input.streak.currentStreak,
    isReturning,
  };
}
