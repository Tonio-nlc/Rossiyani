import type { LearnerProfile } from "@/lib/onboarding/types";
import type { ReviewItemRecord, ReviewLogRecord } from "@/lib/review/types";
import type { TextReadingProgress } from "@/lib/reader/reading-progress";
import type { SavedReaderWord } from "@/lib/reader/saved-words";
import type { SavedDiscovery } from "@/lib/discovery/saved-discoveries";
import type { SavedSentence } from "@/types/saved-sentence";
import type { TranslationDisplayMode } from "@/lib/reader/translation-display-preference";

export const USER_SYNC_VERSION = 1;

export type UserPreferencesSync = {
  translationDisplayMode: TranslationDisplayMode;
  interlinearTranslation: boolean;
  readerFontScale: number;
  readerFocusMode: boolean;
  audioPlaybackSpeed: number;
  lastReadTextId: string | null;
  displayName: string | null;
};

export type ReviewStoreSync = {
  items: ReviewItemRecord[];
  logs: ReviewLogRecord[];
  lastSessionDate: string | null;
  streakDays: number;
  totalReviewTimeMs: number;
};

export type UserSyncPayload = {
  readingProgress: Record<string, TextReadingProgress>;
  savedWords: SavedReaderWord[];
  bookmarks: string[];
  savedSentences: SavedSentence[];
  savedDiscoveries: SavedDiscovery[];
  preferences: UserPreferencesSync;
  reviewStore?: ReviewStoreSync;
  learnerProfile?: LearnerProfile;
};

export type UserSyncState = UserSyncPayload & {
  version: number;
  updatedAt: string;
};

export const EMPTY_LEARNER_PROFILE: LearnerProfile = {
  version: 1,
  completedAt: null,
  level: null,
  goal: null,
  theme: "light",
  translationDefault: "manual",
  audioSpeed: 1,
  firstTextId: null,
  readerCoachCompletedAt: null,
  updatedAt: "1970-01-01T00:00:00.000Z",
};

export const EMPTY_USER_SYNC_PAYLOAD: UserSyncPayload = {
  readingProgress: {},
  savedWords: [],
  bookmarks: [],
  savedSentences: [],
  savedDiscoveries: [],
  preferences: {
    translationDisplayMode: "manual",
    interlinearTranslation: false,
    readerFontScale: 1,
    readerFocusMode: false,
    audioPlaybackSpeed: 1,
    lastReadTextId: null,
    displayName: null,
  },
  reviewStore: {
    items: [],
    logs: [],
    lastSessionDate: null,
    streakDays: 0,
    totalReviewTimeMs: 0,
  },
  learnerProfile: { ...EMPTY_LEARNER_PROFILE },
};
