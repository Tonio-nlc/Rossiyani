import type { ReviewItemRecord, ReviewLearningState, ReviewRating } from "./types";

const RATING_SCORE: Record<ReviewRating, number> = {
  again: 1,
  hard: 2,
  good: 3,
  easy: 4,
};

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

export function applySrsReview(
  item: Pick<
    ReviewItemRecord,
    "easeFactor" | "intervalDays" | "repetitions" | "state"
  >,
  rating: ReviewRating,
  now = new Date(),
): Pick<ReviewItemRecord, "easeFactor" | "intervalDays" | "repetitions" | "state" | "nextReviewAt" | "lastReviewedAt"> {
  const score = RATING_SCORE[rating];
  const lastReviewedAt = now.toISOString();

  if (score < 3) {
    const minutes = score === 1 ? 10 : 60;
    return {
      easeFactor: Math.max(1.3, item.easeFactor - 0.15),
      intervalDays: 0,
      repetitions: 0,
      state: "learning",
      nextReviewAt: addMinutes(now, minutes).toISOString(),
      lastReviewedAt,
    };
  }

  let easeFactor =
    item.easeFactor + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02));
  easeFactor = Math.max(1.3, Math.min(3.0, easeFactor));

  let intervalDays = 0;
  if (item.repetitions === 0) {
    intervalDays = 1;
  } else if (item.repetitions === 1) {
    intervalDays = 6;
  } else {
    intervalDays = Math.max(1, Math.round(item.intervalDays * easeFactor));
  }

  if (rating === "easy") {
    intervalDays = Math.max(1, Math.round(intervalDays * 1.3));
  }

  const repetitions = item.repetitions + 1;
  let state: ReviewLearningState = "review";
  if (intervalDays >= 21 && repetitions >= 3) {
    state = "mastered";
  }

  return {
    easeFactor,
    intervalDays,
    repetitions,
    state,
    nextReviewAt: addDays(now, intervalDays).toISOString(),
    lastReviewedAt,
  };
}

export function isDue(item: ReviewItemRecord, now = new Date()): boolean {
  if (item.suspended) {
    return false;
  }
  return new Date(item.nextReviewAt).getTime() <= now.getTime();
}
