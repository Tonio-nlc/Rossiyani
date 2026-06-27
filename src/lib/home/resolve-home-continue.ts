import { getCollectionName, type CollectionId } from "@/content/collections";
import { estimateReadingMinutes } from "@/components/library/library-utils";
import type { TextListItem } from "@/features/texts";
import { isDisplayableLibraryText } from "@/lib/home/displayable-text";
import { getLearnerProfile } from "@/lib/onboarding/profile";
import { pickFirstOnboardingText } from "@/lib/onboarding/pick-first-text";
import type { LearnerLevel, LearningGoal } from "@/lib/onboarding/types";
import {
  formatLastReadLabel,
  type TextReadingProgress,
} from "@/lib/reader/reading-progress";

export type HomeContinueBlock = {
  title: string;
  collection: string;
  collectionId: CollectionId | null;
  level: string;
  href: string;
  textId: string;
  percent: number;
  estimatedMinutes: number;
  started: boolean;
  detail: string;
  ctaLabel: "Continuer" | "Commencer";
};

function mostRecentInProgressTextId(
  readingProgress: Record<string, TextReadingProgress>,
): string | null {
  const inProgress = Object.values(readingProgress).filter(
    (entry) => entry.wordsSeenIds.length > 0 && entry.percent < 100,
  );
  if (inProgress.length === 0) {
    return null;
  }
  return [...inProgress].sort(
    (left, right) => new Date(right.lastReadAt).getTime() - new Date(left.lastReadAt).getTime(),
  )[0]!.textId;
}

function pickStarterText(texts: TextListItem[]): TextListItem | null {
  const profile = getLearnerProfile();
  if (profile.level) {
    return pickFirstOnboardingText(texts, profile.level);
  }
  if (profile.firstTextId) {
    return texts.find((text) => text.id === profile.firstTextId) ?? null;
  }
  const displayable = texts.filter(isDisplayableLibraryText);
  return (
    displayable
      .filter((text) => text.level === "A1")
      .sort((left, right) => left.sentenceCount - right.sentenceCount)[0] ?? displayable[0] ?? null
  );
}

export function resolveHomeContinueBlock(
  texts: TextListItem[],
  readingProgress: Record<string, TextReadingProgress>,
): HomeContinueBlock | null {
  const displayable = texts.filter(isDisplayableLibraryText);
  if (displayable.length === 0) {
    return null;
  }

  const recentId = mostRecentInProgressTextId(readingProgress);
  const text =
    (recentId ? displayable.find((item) => item.id === recentId) : null) ??
    pickStarterText(displayable);

  if (!text) {
    return null;
  }

  const progress = readingProgress[text.id];
  const started = Boolean(progress && progress.wordsSeenIds.length > 0);
  const percent = progress?.percent ?? 0;
  const lastRead = progress ? formatLastReadLabel(progress.lastReadAt) : null;

  const detail = started
    ? `${percent} % lu${lastRead ? ` · ${lastRead.toLowerCase()}` : ""}`
    : `${text.level} · ${estimateReadingMinutes(text.sentenceCount)} min`;

  return {
    title: text.title,
    collection: getCollectionName(text.collectionId),
    collectionId: text.collectionId,
    level: text.level,
    href: `/texts/${text.id}`,
    textId: text.id,
    percent,
    estimatedMinutes: estimateReadingMinutes(text.sentenceCount),
    started,
    detail,
    ctaLabel: started ? "Continuer" : "Commencer",
  };
}

export function learnerLevelToCefrTargets(
  level: LearnerLevel | null,
): Array<TextListItem["level"]> {
  switch (level) {
    case "intermediate":
      return ["A2", "B1", "B2"];
    case "beginner":
    case "alphabet":
    case "discovering":
      return ["A1", "A2"];
    case "unknown":
    default:
      return ["A1", "A2", "B1"];
  }
}

export function goalCollectionAffinity(goal: LearningGoal | null): CollectionId | null {
  switch (goal) {
    case "travel":
      return "travel-russian";
    case "culture":
      return "culture";
    case "study":
    case "work":
      return "slow-news";
    case "family":
    case "curiosity":
      return "everyday-russian";
    default:
      return null;
  }
}
