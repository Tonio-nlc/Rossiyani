export const LEARNER_ID_COOKIE = "rossiyani_learner_id";
export const LEARNING_SIGNALS_COOKIE = "rossiyani_learning_signals";
export const DAILY_DISCOVERY_COOKIE = "rossiyani_daily_discovery";
export const DAILY_FEATURED_LESSON_COOKIE = "rossiyani_daily_featured_lesson";

/** Set by middleware on first visit so RSC can read the id in the same request. */
export const LEARNER_ID_HEADER = "x-rossiyani-learner-id";

export const LEARNER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
export const DAILY_DISCOVERY_COOKIE_MAX_AGE = 60 * 60 * 48;
