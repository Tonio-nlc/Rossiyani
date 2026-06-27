import type { LearnerProfile } from "@/lib/onboarding/types";
import type { SavedDiscovery } from "@/lib/discovery/saved-discoveries";
import type { TextReadingProgress } from "@/lib/reader/reading-progress";
import type { SavedReaderWord } from "@/lib/reader/saved-words";
import type { SavedSentence } from "@/types/saved-sentence";

import {
  EMPTY_USER_SYNC_PAYLOAD,
  USER_SYNC_VERSION,
  EMPTY_LEARNER_PROFILE,
  type ReviewStoreSync,
  type UserPreferencesSync,
  type UserSyncPayload,
  type UserSyncState,
} from "./types";

export const SYNC_STORAGE_KEYS = {
  readingProgress: "rossiyani:readingProgress",
  savedWords: "rossiyani:readerSavedWords",
  bookmarks: "rossiyani:readerBookmarks",
  savedSentences: "rossiyani:savedSentences",
  savedDiscoveries: "rossiyani:savedDiscoveries",
  reviewStore: "rossiyani:reviewStore",
  learnerProfile: "rossiyani:learnerProfile",
  translationMode: "rossiyani:translationDisplayMode",
  interlinear: "rossiyani:interlinearTranslation",
  fontScale: "rossiyani:readerFontScale",
  focusMode: "rossiyani:readerFocusMode",
  audioSpeed: "rossiyani:audioPlaybackSpeed",
  lastReadTextId: "rossiyani:lastTextId",
  displayName: "rossiyani:displayName",
} as const;

function isBrowser(): boolean {
  return typeof localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readString(key: string): string | null {
  if (!isBrowser()) {
    return null;
  }
  return localStorage.getItem(key);
}

export function collectLocalUserSyncPayload(): UserSyncPayload {
  if (!isBrowser()) {
    return EMPTY_USER_SYNC_PAYLOAD;
  }

  const readingProgress = readJson<Record<string, TextReadingProgress>>(
    SYNC_STORAGE_KEYS.readingProgress,
    {},
  );
  const savedWords = readJson<SavedReaderWord[]>(SYNC_STORAGE_KEYS.savedWords, []);
  const bookmarks = readJson<string[]>(SYNC_STORAGE_KEYS.bookmarks, []);
  const savedSentences = readJson<SavedSentence[]>(SYNC_STORAGE_KEYS.savedSentences, []);
  const savedDiscoveries = readJson<SavedDiscovery[]>(SYNC_STORAGE_KEYS.savedDiscoveries, []);
  const reviewStore = readJson<ReviewStoreSync>(
    SYNC_STORAGE_KEYS.reviewStore,
    EMPTY_USER_SYNC_PAYLOAD.reviewStore!,
  );
  const learnerProfile = readJson<LearnerProfile>(
    SYNC_STORAGE_KEYS.learnerProfile,
    EMPTY_LEARNER_PROFILE,
  );

  const translationRaw = readString(SYNC_STORAGE_KEYS.translationMode);
  const translationDisplayMode =
    translationRaw === "hidden" || translationRaw === "manual" || translationRaw === "all"
      ? translationRaw
      : "manual";

  const fontScaleRaw = Number(readString(SYNC_STORAGE_KEYS.fontScale));
  const audioSpeedRaw = Number(readString(SYNC_STORAGE_KEYS.audioSpeed));

  const preferences: UserPreferencesSync = {
    translationDisplayMode,
    interlinearTranslation: readString(SYNC_STORAGE_KEYS.interlinear) === "1",
    readerFontScale: [1, 1.125, 1.25].includes(fontScaleRaw) ? fontScaleRaw : 1,
    readerFocusMode: readString(SYNC_STORAGE_KEYS.focusMode) === "1",
    audioPlaybackSpeed: [0.75, 1, 1.25, 1.5].includes(audioSpeedRaw) ? audioSpeedRaw : 1,
    lastReadTextId: readString(SYNC_STORAGE_KEYS.lastReadTextId),
    displayName: readString(SYNC_STORAGE_KEYS.displayName),
  };

  return {
    readingProgress,
    savedWords,
    bookmarks,
    savedSentences,
    savedDiscoveries,
    preferences,
    reviewStore,
    learnerProfile,
  };
}

export function applyUserSyncPayload(payload: UserSyncPayload): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(SYNC_STORAGE_KEYS.readingProgress, JSON.stringify(payload.readingProgress));
  localStorage.setItem(SYNC_STORAGE_KEYS.savedWords, JSON.stringify(payload.savedWords));
  localStorage.setItem(SYNC_STORAGE_KEYS.bookmarks, JSON.stringify(payload.bookmarks));
  localStorage.setItem(SYNC_STORAGE_KEYS.savedSentences, JSON.stringify(payload.savedSentences));
  localStorage.setItem(SYNC_STORAGE_KEYS.savedDiscoveries, JSON.stringify(payload.savedDiscoveries));
  if (payload.reviewStore) {
    localStorage.setItem(SYNC_STORAGE_KEYS.reviewStore, JSON.stringify(payload.reviewStore));
  }
  if (payload.learnerProfile) {
    localStorage.setItem(SYNC_STORAGE_KEYS.learnerProfile, JSON.stringify(payload.learnerProfile));
  }
  localStorage.setItem(SYNC_STORAGE_KEYS.translationMode, payload.preferences.translationDisplayMode);
  localStorage.setItem(
    SYNC_STORAGE_KEYS.interlinear,
    payload.preferences.interlinearTranslation ? "1" : "0",
  );
  localStorage.setItem(SYNC_STORAGE_KEYS.fontScale, String(payload.preferences.readerFontScale));
  localStorage.setItem(
    SYNC_STORAGE_KEYS.focusMode,
    payload.preferences.readerFocusMode ? "1" : "0",
  );
  localStorage.setItem(SYNC_STORAGE_KEYS.audioSpeed, String(payload.preferences.audioPlaybackSpeed));

  if (payload.preferences.lastReadTextId) {
    localStorage.setItem(SYNC_STORAGE_KEYS.lastReadTextId, payload.preferences.lastReadTextId);
  } else {
    localStorage.removeItem(SYNC_STORAGE_KEYS.lastReadTextId);
  }

  if (payload.preferences.displayName) {
    localStorage.setItem(SYNC_STORAGE_KEYS.displayName, payload.preferences.displayName);
  } else {
    localStorage.removeItem(SYNC_STORAGE_KEYS.displayName);
  }
}

export function hasLocalUserData(): boolean {
  const payload = collectLocalUserSyncPayload();
  return (
    Object.keys(payload.readingProgress).length > 0 ||
    payload.savedWords.length > 0 ||
    payload.bookmarks.length > 0 ||
    payload.savedSentences.length > 0 ||
    payload.savedDiscoveries.length > 0 ||
    (payload.reviewStore?.items.length ?? 0) > 0 ||
    Boolean(payload.learnerProfile?.completedAt) ||
    payload.preferences.lastReadTextId !== null
  );
}

export function isUserSyncPayloadEmpty(payload: UserSyncPayload): boolean {
  return (
    Object.keys(payload.readingProgress).length === 0 &&
    payload.savedWords.length === 0 &&
    payload.bookmarks.length === 0 &&
    payload.savedSentences.length === 0 &&
    payload.savedDiscoveries.length === 0 &&
    (payload.reviewStore?.items.length ?? 0) === 0 &&
    payload.preferences.lastReadTextId === null
  );
}

function mergeReadingProgress(
  local: Record<string, TextReadingProgress>,
  remote: Record<string, TextReadingProgress>,
): Record<string, TextReadingProgress> {
  const merged: Record<string, TextReadingProgress> = { ...remote };

  for (const [textId, localProgress] of Object.entries(local)) {
    const remoteProgress = merged[textId];
    if (!remoteProgress) {
      merged[textId] = localProgress;
      continue;
    }

    const localTime = new Date(localProgress.lastReadAt).getTime();
    const remoteTime = new Date(remoteProgress.lastReadAt).getTime();
    const winner = localTime >= remoteTime ? localProgress : remoteProgress;
    const loser = localTime >= remoteTime ? remoteProgress : localProgress;

    merged[textId] = {
      ...winner,
      wordsSeenIds: [...new Set([...winner.wordsSeenIds, ...loser.wordsSeenIds])],
      learnableWordsSeenIds: [
        ...new Set([
          ...(winner.learnableWordsSeenIds ?? []),
          ...(loser.learnableWordsSeenIds ?? []),
        ]),
      ],
      sentencesSeenIds: [...new Set([...winner.sentencesSeenIds, ...loser.sentencesSeenIds])],
      readingTimeMs: winner.readingTimeMs + loser.readingTimeMs,
      totalWords: Math.max(winner.totalWords, loser.totalWords),
      percent: Math.max(winner.percent, loser.percent),
    };
  }

  return merged;
}

function mergeSavedWords(local: SavedReaderWord[], remote: SavedReaderWord[]): SavedReaderWord[] {
  const byKey = new Map<string, SavedReaderWord>();
  for (const word of [...remote, ...local]) {
    const key = `${word.textId}:${word.displayForm.trim().toLowerCase()}`;
    const existing = byKey.get(key);
    if (!existing || new Date(word.savedAt) > new Date(existing.savedAt)) {
      byKey.set(key, word);
    }
  }
  return [...byKey.values()].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
}

function mergeById<T extends { id: string }>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of [...remote, ...local]) {
    map.set(item.id, item);
  }
  return [...map.values()];
}

function mergeReviewStore(local: ReviewStoreSync, remote: ReviewStoreSync): ReviewStoreSync {
  const byKey = new Map<string, (typeof local.items)[number]>();
  for (const item of [...remote.items, ...local.items]) {
    const existing = byKey.get(item.sourceKey);
    if (!existing || item.repetitions > existing.repetitions) {
      byKey.set(item.sourceKey, item);
      continue;
    }
    if (
      item.repetitions === existing.repetitions &&
      new Date(item.nextReviewAt).getTime() > new Date(existing.nextReviewAt).getTime()
    ) {
      byKey.set(item.sourceKey, item);
    }
  }

  const logs = [...remote.logs, ...local.logs];
  const logIds = new Set<string>();
  const mergedLogs = logs.filter((log) => {
    if (logIds.has(log.id)) {
      return false;
    }
    logIds.add(log.id);
    return true;
  });

  return {
    items: [...byKey.values()],
    logs: mergedLogs,
    lastSessionDate: [local.lastSessionDate, remote.lastSessionDate]
      .filter(Boolean)
      .sort()
      .at(-1) ?? null,
    streakDays: Math.max(local.streakDays, remote.streakDays),
    totalReviewTimeMs: local.totalReviewTimeMs + remote.totalReviewTimeMs,
  };
}

function mergeLearnerProfile(local: LearnerProfile, remote: LearnerProfile): LearnerProfile {
  const localTime = new Date(local.updatedAt).getTime();
  const remoteTime = new Date(remote.updatedAt).getTime();
  const winner = localTime >= remoteTime ? local : remote;
  const loser = localTime >= remoteTime ? remote : local;

  return {
    ...winner,
    completedAt: winner.completedAt ?? loser.completedAt,
    level: winner.level ?? loser.level,
    goal: winner.goal ?? loser.goal,
    firstTextId: winner.firstTextId ?? loser.firstTextId,
    readerCoachCompletedAt: winner.readerCoachCompletedAt ?? loser.readerCoachCompletedAt,
  };
}

export function mergeUserSyncPayload(local: UserSyncPayload, remote: UserSyncPayload): UserSyncPayload {
  return {
    readingProgress: mergeReadingProgress(local.readingProgress, remote.readingProgress),
    savedWords: mergeSavedWords(local.savedWords, remote.savedWords),
    bookmarks: [...new Set([...remote.bookmarks, ...local.bookmarks])],
    savedSentences: mergeById(local.savedSentences, remote.savedSentences),
    savedDiscoveries: mergeById(local.savedDiscoveries, remote.savedDiscoveries),
    preferences: {
      ...remote.preferences,
      ...local.preferences,
      displayName: local.preferences.displayName ?? remote.preferences.displayName,
      lastReadTextId: local.preferences.lastReadTextId ?? remote.preferences.lastReadTextId,
    },
    reviewStore: mergeReviewStore(
      local.reviewStore ?? EMPTY_USER_SYNC_PAYLOAD.reviewStore!,
      remote.reviewStore ?? EMPTY_USER_SYNC_PAYLOAD.reviewStore!,
    ),
    learnerProfile: mergeLearnerProfile(
      local.learnerProfile ?? EMPTY_LEARNER_PROFILE,
      remote.learnerProfile ?? EMPTY_LEARNER_PROFILE,
    ),
  };
}

export function toUserSyncState(payload: UserSyncPayload, updatedAt?: string): UserSyncState {
  return {
    ...payload,
    version: USER_SYNC_VERSION,
    updatedAt: updatedAt ?? new Date().toISOString(),
  };
}

export function hashUserSyncPayload(payload: UserSyncPayload): string {
  return JSON.stringify(payload);
}
