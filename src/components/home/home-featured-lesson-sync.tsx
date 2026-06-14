"use client";

import { useEffect } from "react";

import {
  DAILY_FEATURED_LESSON_COOKIE,
  DAILY_DISCOVERY_COOKIE_MAX_AGE,
  LEARNER_ID_COOKIE,
} from "@/features/discovery/cookies";

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/** Persists today's featured lesson slug — cookie writes are client-only (Next.js RSC restriction). */
export function persistFeaturedLessonCookie(slug: string, dateKey: string): void {
  const learnerId = readCookie(LEARNER_ID_COOKIE);
  if (!learnerId || slug.trim().length === 0) {
    return;
  }

  const payload = encodeURIComponent(
    JSON.stringify({
      dateKey,
      lessonSlug: slug,
      learnerId,
    }),
  );

  document.cookie = `${DAILY_FEATURED_LESSON_COOKIE}=${payload}; path=/; max-age=${DAILY_DISCOVERY_COOKIE_MAX_AGE}; SameSite=Lax`;
}

type HomeFeaturedLessonSyncProps = {
  slug: string;
  dateKey: string;
};

export function HomeFeaturedLessonSync({ slug, dateKey }: HomeFeaturedLessonSyncProps) {
  useEffect(() => {
    persistFeaturedLessonCookie(slug, dateKey);
  }, [slug, dateKey]);

  return null;
}
