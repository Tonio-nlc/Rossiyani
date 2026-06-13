"use client";

import type { TodaysDiscovery } from "@/features/discovery";
import {
  DAILY_DISCOVERY_COOKIE,
  DAILY_DISCOVERY_COOKIE_MAX_AGE,
  LEARNER_ID_COOKIE,
} from "@/features/discovery/cookies";

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/** Persists today's discovery — cookie writes are client-only (Next.js RSC restriction). */
export function persistDailyDiscoveryCookie(discovery: TodaysDiscovery): void {
  const learnerId = readCookie(LEARNER_ID_COOKIE);
  if (!learnerId) {
    return;
  }

  const payload = encodeURIComponent(
    JSON.stringify({
      dateKey: discovery.dateKey,
      candidateId: discovery.id,
      learnerId,
    }),
  );

  document.cookie = `${DAILY_DISCOVERY_COOKIE}=${payload}; path=/; max-age=${DAILY_DISCOVERY_COOKIE_MAX_AGE}; SameSite=Lax`;
}
