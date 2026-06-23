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
import { buildRecentDiscoveryCards } from "@/lib/home/build-recent-discovery-chips";
import {
  buildSessionJournal,
  buildSessionJournalFromServer,
  type SessionJournal,
} from "@/lib/home/build-session-journal";
import { getLearningStreakSnapshot } from "@/lib/home/learning-streak";
import { resolveContinueReading } from "@/lib/home/resolve-continue-reading";
import { getAllReadingProgress } from "@/lib/reader/reading-progress";
import { getSavedReaderWords } from "@/lib/reader/saved-words";

import { HomeWorkspaceCollections } from "./home-workspace-collections";
import { HomeWorkspaceContinue } from "./home-workspace-continue";
import { HomeWorkspaceDiscoveries } from "./home-workspace-discoveries";
import { HomeWorkspaceExploration } from "./home-workspace-exploration";
import { HomeWorkspaceMetrics } from "./home-workspace-metrics";

type HomeDashboardProps = {
  journal: HomeJournalData;
  texts: TextListItem[];
};

export function HomeDashboard({ journal, texts }: HomeDashboardProps) {
  const [narrative, setNarrative] = useState<SessionJournal>(() =>
    buildSessionJournalFromServer(journal, texts),
  );
  const [clientReady, setClientReady] = useState(false);
  const [savedWordCount, setSavedWordCount] = useState(0);

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
    setSavedWordCount(savedWords.length);
    setClientReady(true);
  }, [journal, texts]);

  const streak = useMemo(() => {
    if (!clientReady) {
      return {
        currentStreak: 0,
        weeklyActivity: [false, false, false, false, false, false, false],
        wordsToday: 0,
      };
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
      buildRecentDiscoveryCards({
        exploration: clientReady ? getExplorationHistory() : [],
        recentlyLearned: narrative.recentlyLearned,
        journal,
      }),
    [clientReady, journal, narrative.recentlyLearned],
  );

  const continueMeta = useMemo(
    () => resolveContinueReading(narrative, texts),
    [narrative, texts],
  );

  return (
    <div className="home-ws">
      <header className="home-ws__bar">
        <div>
          <p className="home-ws__eyebrow">Rossiyani</p>
          <h1 className="home-ws__title">Your workspace</h1>
        </div>
        <p className="home-ws__subtitle">
          {metrics.isReturning
            ? "Continue where you left off."
            : "Start reading to populate your dashboard."}
        </p>
      </header>

      <div className="home-ws__top">
        {continueMeta ? <HomeWorkspaceContinue meta={continueMeta} /> : null}
        <HomeWorkspaceMetrics metrics={metrics} streak={streak} />
      </div>

      <HomeWorkspaceCollections texts={texts} />
      <HomeWorkspaceExploration
        savedWordCount={savedWordCount}
        discoveryCount={discoveries.length}
      />
      <HomeWorkspaceDiscoveries cards={discoveries} />
    </div>
  );
}
