import { cookies, headers } from "next/headers";

import {
  DAILY_DISCOVERY_COOKIE,
  LEARNER_ID_COOKIE,
  LEARNER_ID_HEADER,
  LEARNING_SIGNALS_COOKIE,
} from "./cookies";
import type { LearningSignals } from "./types";
import { EMPTY_LEARNING_SIGNALS } from "./types";

export {
  DAILY_DISCOVERY_COOKIE,
  LEARNER_ID_COOKIE,
  LEARNING_SIGNALS_COOKIE,
} from "./cookies";

export type DailyDiscoveryCache = {
  dateKey: string;
  candidateId: string;
  learnerId: string;
};

function parseSignals(raw: string | undefined): LearningSignals {
  if (!raw) {
    return EMPTY_LEARNING_SIGNALS;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<LearningSignals>;
    const discoveryArchive =
      parsed.discoveryArchive ??
      (parsed.featuredHistory ?? []).map((candidateId) => ({
        candidateId,
        dateKey: "1970-01-01",
      }));

    return {
      exploredLemmas: parsed.exploredLemmas ?? [],
      exploredConcepts: parsed.exploredConcepts ?? [],
      exploredPhrases: parsed.exploredPhrases ?? [],
      readTextIds: parsed.readTextIds ?? [],
      practiceStructures: parsed.practiceStructures ?? [],
      savedPhraseTexts: parsed.savedPhraseTexts ?? [],
      recentTopics: parsed.recentTopics ?? [],
      discoveryArchive,
      featuredHistory: parsed.featuredHistory ?? discoveryArchive.map((entry) => entry.candidateId),
    };
  } catch {
    return EMPTY_LEARNING_SIGNALS;
  }
}

function parseDailyCache(raw: string | undefined): DailyDiscoveryCache | null {
  if (!raw) {
    return null;
  }

  try {
    const decoded = raw.startsWith("%7B") || raw.startsWith("%") ? decodeURIComponent(raw) : raw;
    const parsed = JSON.parse(decoded) as Partial<DailyDiscoveryCache>;
    if (
      typeof parsed.dateKey === "string" &&
      typeof parsed.candidateId === "string" &&
      typeof parsed.learnerId === "string"
    ) {
      return parsed as DailyDiscoveryCache;
    }
    return null;
  } catch {
    return null;
  }
}

/** Read-only — never mutates cookies. */
export async function getLearnerContext(dateKey: string): Promise<{
  learnerId: string | null;
  signals: LearningSignals;
  cachedDiscovery: DailyDiscoveryCache | null;
}> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const learnerId =
    cookieStore.get(LEARNER_ID_COOKIE)?.value ??
    headerStore.get(LEARNER_ID_HEADER) ??
    null;

  const signals = parseSignals(cookieStore.get(LEARNING_SIGNALS_COOKIE)?.value);
  const cachedDiscovery = parseDailyCache(cookieStore.get(DAILY_DISCOVERY_COOKIE)?.value);

  if (
    cachedDiscovery &&
    learnerId &&
    cachedDiscovery.dateKey === dateKey &&
    cachedDiscovery.learnerId === learnerId
  ) {
    return { learnerId, signals, cachedDiscovery };
  }

  return { learnerId, signals, cachedDiscovery: null };
}
