import { getAllReadingProgress } from "@/lib/reader/reading-progress";
import { getSavedReaderWords } from "@/lib/reader/saved-words";

import type { LearnerProfile } from "./types";

const PROFILE_KEY = "rossiyani:learnerProfile";
const LEGACY_COMPLETE_KEY = "rossiyani_onboarding_complete";
export const PROFILE_VERSION = 1;

export function emptyLearnerProfile(): LearnerProfile {
  return {
    version: PROFILE_VERSION,
    completedAt: null,
    level: null,
    goal: null,
    theme: "light",
    translationDefault: "manual",
    audioSpeed: 1,
    firstTextId: null,
    readerCoachCompletedAt: null,
    updatedAt: new Date().toISOString(),
  };
}

function isBrowser(): boolean {
  return typeof localStorage !== "undefined";
}

export function getLearnerProfile(): LearnerProfile {
  if (!isBrowser()) {
    return emptyLearnerProfile();
  }

  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      return emptyLearnerProfile();
    }
    return { ...emptyLearnerProfile(), ...(JSON.parse(raw) as LearnerProfile) };
  } catch {
    return emptyLearnerProfile();
  }
}

export function saveLearnerProfile(profile: LearnerProfile): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify({ ...profile, updatedAt: new Date().toISOString() }),
  );
}

export function patchLearnerProfile(patch: Partial<LearnerProfile>): LearnerProfile {
  const next = { ...getLearnerProfile(), ...patch, updatedAt: new Date().toISOString() };
  saveLearnerProfile(next);
  return next;
}

function hasLegacyOnboardingComplete(): boolean {
  if (!isBrowser()) {
    return false;
  }
  return localStorage.getItem(LEGACY_COMPLETE_KEY) === "1";
}

function hasExistingLearningActivity(): boolean {
  if (!isBrowser()) {
    return false;
  }
  return (
    Object.keys(getAllReadingProgress()).length > 0 || getSavedReaderWords().length > 0
  );
}

export function isOnboardingComplete(): boolean {
  const profile = getLearnerProfile();
  if (profile.completedAt) {
    return true;
  }
  if (hasLegacyOnboardingComplete()) {
    return true;
  }
  if (hasExistingLearningActivity()) {
    return true;
  }
  return false;
}

export function completeOnboarding(input: {
  level: NonNullable<LearnerProfile["level"]>;
  goal: NonNullable<LearnerProfile["goal"]>;
  theme: LearnerProfile["theme"];
  translationDefault: LearnerProfile["translationDefault"];
  audioSpeed: LearnerProfile["audioSpeed"];
  firstTextId: string;
}): LearnerProfile {
  const profile = patchLearnerProfile({
    ...input,
    completedAt: new Date().toISOString(),
  });
  if (isBrowser()) {
    localStorage.setItem(LEGACY_COMPLETE_KEY, "1");
  }
  return profile;
}

export function shouldShowFirstReadingCoach(textId: string): boolean {
  const profile = getLearnerProfile();
  if (!profile.completedAt || profile.readerCoachCompletedAt) {
    return false;
  }
  return profile.firstTextId === textId;
}

export function completeFirstReadingCoach(): void {
  patchLearnerProfile({ readerCoachCompletedAt: new Date().toISOString() });
}

export function resetOnboarding(): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(LEGACY_COMPLETE_KEY);
}
