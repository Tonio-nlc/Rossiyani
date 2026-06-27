import type { HomeJournalData } from "@/features/home";
import type { TextListItem } from "@/features/texts";
import { isOnboardingComplete } from "@/lib/onboarding/profile";
import { getLocalReviewStats } from "@/lib/review";
import type { ReviewStats } from "@/lib/review";
import { getSavedReaderWords } from "@/lib/reader/saved-words";
import type { TextReadingProgress } from "@/lib/reader/reading-progress";
import { getLearningStreakSnapshot } from "@/lib/home/learning-streak";
import type { ExplorationEntry } from "@/lib/explorer/exploration-history";

import { pickHomeCollectionHighlights, type HomeCollectionHighlight } from "./pick-home-collections";
import { pickHomeJourneyTexts, type HomeJourneyCard } from "./pick-home-journey-texts";
import { resolveHomeContinueBlock, type HomeContinueBlock } from "./resolve-home-continue";

export type HomeUserState = "first_launch" | "no_text_started" | "active" | "advanced";

export type HomeProgressSnapshot = {
  textsCompleted: number;
  wordsLearned: number;
  cardsMastered: number;
  currentStreak: number;
};

export type HomeReviewPrompt = {
  dueCount: number;
  estimatedMinutes: number;
};

export type HomeSessionViewModel = {
  userState: HomeUserState;
  greeting: string;
  subtitle: string;
  continueBlock: HomeContinueBlock | null;
  review: HomeReviewPrompt | null;
  journey: HomeJourneyCard[];
  discovery: HomeJournalData["todaysDiscovery"];
  progress: HomeProgressSnapshot;
  collections: HomeCollectionHighlight[];
};

function detectUserState(
  readingProgress: Record<string, TextReadingProgress>,
  savedWordCount: number,
): HomeUserState {
  if (!isOnboardingComplete()) {
    return "first_launch";
  }

  const entries = Object.values(readingProgress);
  const hasStarted = entries.some((entry) => entry.wordsSeenIds.length > 0);
  if (!hasStarted) {
    return "no_text_started";
  }

  const completed = entries.filter((entry) => entry.percent >= 100).length;
  if (completed >= 3 || savedWordCount >= 40) {
    return "advanced";
  }

  return "active";
}

function buildGreeting(userState: HomeUserState): { greeting: string; subtitle: string } {
  switch (userState) {
    case "first_launch":
      return {
        greeting: "Bienvenue",
        subtitle: "Votre prochaine lecture est à un clic.",
      };
    case "no_text_started":
      return {
        greeting: "Prêt à lire",
        subtitle: "Choisissez un texte et commencez votre parcours.",
      };
    case "advanced":
      return {
        greeting: "Bon retour",
        subtitle: "Reprenez là où vous vous êtes arrêté.",
      };
    case "active":
    default:
      return {
        greeting: "Bon retour",
        subtitle: "Quelques minutes suffisent pour avancer aujourd'hui.",
      };
  }
}

function buildReviewPrompt(stats: ReviewStats): HomeReviewPrompt | null {
  if (stats.dueToday <= 0) {
    return null;
  }
  return {
    dueCount: stats.dueToday,
    estimatedMinutes: Math.max(1, Math.ceil(stats.dueToday * 0.75)),
  };
}

export function buildHomeSessionViewModel(input: {
  journal: HomeJournalData;
  texts: TextListItem[];
  readingProgress: Record<string, TextReadingProgress>;
  exploration: ExplorationEntry[];
}): HomeSessionViewModel {
  const savedWordCount = getSavedReaderWords().length;
  const userState = detectUserState(input.readingProgress, savedWordCount);
  const { greeting, subtitle } = buildGreeting(userState);
  const continueBlock = resolveHomeContinueBlock(input.texts, input.readingProgress);
  const reviewStats = getLocalReviewStats();
  const streak = getLearningStreakSnapshot(input.exploration);

  const progressEntries = Object.values(input.readingProgress);

  return {
    userState,
    greeting,
    subtitle,
    continueBlock,
    review: buildReviewPrompt(reviewStats),
    journey: pickHomeJourneyTexts(
      input.texts,
      input.readingProgress,
      continueBlock?.textId ?? null,
      3,
    ),
    discovery: input.journal.todaysDiscovery,
    progress: {
      textsCompleted: progressEntries.filter((entry) => entry.percent >= 100).length,
      wordsLearned: savedWordCount,
      cardsMastered: reviewStats.mastered,
      currentStreak: Math.max(streak.currentStreak, reviewStats.streakDays),
    },
    collections: pickHomeCollectionHighlights(input.texts, input.readingProgress, 3),
  };
}

export function hasHomeProgress(progress: HomeProgressSnapshot): boolean {
  return (
    progress.textsCompleted > 0 ||
    progress.wordsLearned > 0 ||
    progress.cardsMastered > 0 ||
    progress.currentStreak > 0
  );
}
