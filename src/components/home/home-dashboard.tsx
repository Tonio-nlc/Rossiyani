"use client";

import { useEffect, useMemo, useState } from "react";

import type { HomeJournalData } from "@/features/home";
import type { TextListItem } from "@/features/texts";
import { getSavedComposePhrases } from "@/lib/compose/saved-phrases";
import { buildLearningSignals } from "@/lib/discovery/build-learning-signals";
import {
  getDiscoveryArchive,
  getSavedDiscoveries,
} from "@/lib/discovery/saved-discoveries";
import { getExplorationHistory } from "@/lib/explorer/exploration-history";
import { buildHomeDashboardMetrics } from "@/lib/home/build-home-dashboard-metrics";
import { buildRecentDiscoveryChips } from "@/lib/home/build-recent-discovery-chips";
import {
  buildSessionJournal,
  buildSessionJournalFromServer,
  type SessionJournal,
} from "@/lib/home/build-session-journal";
import { getLearningStreakSnapshot } from "@/lib/home/learning-streak";
import { getAllReadingProgress } from "@/lib/reader/reading-progress";
import { getSavedReaderWords } from "@/lib/reader/saved-words";

import { HomeDashboardActions } from "./home-dashboard-actions";
import { HomeDashboardCollections } from "./home-dashboard-collections";
import { HomeDashboardContinue } from "./home-dashboard-continue";
import { HomeDashboardDiscoveries } from "./home-dashboard-discoveries";
import { HomeDashboardHero } from "./home-dashboard-hero";

type HomeDashboardProps = {
  journal: HomeJournalData;
  texts: TextListItem[];
};

export function HomeDashboard({ journal, texts }: HomeDashboardProps) {
  const [narrative, setNarrative] = useState<SessionJournal>(() =>
    buildSessionJournalFromServer(journal, texts),
  );

  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    const readingProgress = getAllReadingProgress();
    const exploration = getExplorationHistory();
    const savedWords = getSavedReaderWords();

    setNarrative(
      buildSessionJournal({
        journal,
        texts,
        signals: buildLearningSignals(),
        savedWords,
        savedDiscoveries: getSavedDiscoveries(),
        exploration,
        discoveryArchive: getDiscoveryArchive(),
        savedPhrases: getSavedComposePhrases(),
        readingProgress,
      }),
    );
    setClientReady(true);
  }, [journal, texts]);

  const streak = useMemo(() => {
    if (!clientReady) {
      return { currentStreak: 0, weeklyActivity: [false, false, false, false, false, false, false], wordsToday: 0 };
    }
    return getLearningStreakSnapshot(getExplorationHistory());
  }, [clientReady]);

  const metrics = useMemo(() => {
    if (!clientReady) {
      return {
        wordsExplored: 0,
        textsCompleted: 0,
        conceptsExplored: 0,
        currentStreak: 0,
        isReturning: false,
      };
    }

    return buildHomeDashboardMetrics({
      readingProgress: getAllReadingProgress(),
      exploration: getExplorationHistory(),
      savedWords: getSavedReaderWords(),
      streak,
    });
  }, [clientReady, streak]);

  const discoveries = useMemo(
    () =>
      buildRecentDiscoveryChips({
        exploration: clientReady ? getExplorationHistory() : [],
        recentlyLearned: narrative.recentlyLearned,
        journal,
      }),
    [clientReady, journal, narrative.recentlyLearned],
  );

  return (
    <div className="home-dash">
      <HomeDashboardHero metrics={metrics} streak={streak} />
      <HomeDashboardContinue narrative={narrative} texts={texts} />
      <HomeDashboardActions />
      <HomeDashboardDiscoveries chips={discoveries} />
      <HomeDashboardCollections texts={texts} />
    </div>
  );
}
