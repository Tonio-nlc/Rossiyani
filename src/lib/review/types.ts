export type ReviewCardType = "vocabulary" | "expression" | "grammar";

export type ReviewLearningState = "new" | "learning" | "review" | "mastered";

export type ReviewRating = "again" | "hard" | "good" | "easy";

export type ReviewAudioTarget =
  | { scope: "word"; entityId: string }
  | { scope: "utterance"; text: string; cacheKey: string };

export type ReviewCardContent = {
  prompt: string;
  answer: string;
  hint: string | null;
  exampleRussian: string | null;
  exampleTranslation: string | null;
  partOfSpeech: string | null;
  sourceTextId: string | null;
  sourceTextTitle: string | null;
  sourceTextHref: string | null;
  vocabularyHref: string | null;
  audioTarget: ReviewAudioTarget | null;
};

export type ReviewItemRecord = {
  id: string;
  type: ReviewCardType;
  sourceKey: string;
  content: ReviewCardContent;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  state: ReviewLearningState;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  suspended: boolean;
  createdAt: string;
};

export type ReviewLogRecord = {
  id: string;
  reviewItemId: string;
  rating: ReviewRating;
  reviewedAt: string;
  timeMs: number | null;
};

export type ReviewStats = {
  dueToday: number;
  newAvailable: number;
  mastered: number;
  total: number;
  reviewedToday: number;
  streakDays: number;
  totalReviewTimeMs: number;
};

export type ReviewSessionCard = {
  item: ReviewItemRecord;
  isNew: boolean;
};

export const REVIEW_SESSION_LIMIT = 15;
