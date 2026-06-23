"use client";

import { useEffect, useMemo, useState } from "react";

import type { HomeJournalData } from "@/features/home";
import type { TextListItem } from "@/features/texts";
import { getSavedComposePhrases } from "@/lib/compose/saved-phrases";
import { getSavedContextTranslationLessons } from "@/lib/context-translation/saved-lessons";
import { buildLearningSignals } from "@/lib/discovery/build-learning-signals";
import {
  getDiscoveryArchive,
  getSavedDiscoveries,
} from "@/lib/discovery/saved-discoveries";
import { getExplorationHistory } from "@/lib/explorer/exploration-history";
import { buildHomeDashboardMetrics } from "@/lib/home/build-home-dashboard-metrics";
import { buildTodaysPractice } from "@/lib/home/build-todays-practice";
import {
  buildSessionJournal,
  buildSessionJournalFromServer,
  type SessionJournal,
} from "@/lib/home/build-session-journal";
import { getLearningStreakSnapshot } from "@/lib/home/learning-streak";
import { pickFeaturedCollection } from "@/lib/home/pick-featured-collection";
import { pickRecommendedTexts } from "@/lib/home/pick-recommended-texts";
import { resolveContinueReading } from "@/lib/home/resolve-continue-reading";
import { getAllReadingProgress } from "@/lib/reader/reading-progress";
import { getSavedReaderWords } from "@/lib/reader/saved-words";

import { HomeWorkspaceContinue } from "./home-workspace-continue";
import { HomeWorkspaceExploration } from "./home-workspace-exploration";
import { HomeWorkspaceFeaturedCollection } from "./home-workspace-featured-collection";
import { HomeWorkspaceMetrics } from "./home-workspace-metrics";
import { HomeWorkspaceMotivation } from "./home-workspace-motivation";
import { HomeWorkspaceRecommendedReading } from "./home-workspace-recommended-reading";
import { HomeWorkspaceTodaysPractice } from "./home-workspace-todays-practice";

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
  const [explorationCount, setExplorationCount] = useState(0);

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
    setExplorationCount(exploration.length);
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

  const continueMeta = useMemo(
    () => resolveContinueReading(narrative, texts),
    [narrative, texts],
  );

  const readingProgress = useMemo(
    () => (clientReady ? getAllReadingProgress() : {}),
    [clientReady],
  );

  const featuredCollection = useMemo(
    () =>
      pickFeaturedCollection(texts, readingProgress, continueMeta?.collectionId ?? null),
    [texts, readingProgress, continueMeta?.collectionId],
  );

  const recommendedTexts = useMemo(
    () => pickRecommendedTexts(texts, readingProgress, continueMeta?.textId ?? null),
    [texts, readingProgress, continueMeta?.textId],
  );

  const todaysPractice = useMemo(() => {
    if (!clientReady) {
      return buildTodaysPractice({
        journal,
        composePhraseCount: 0,
        contextLessonCount: 0,
      });
    }

    return buildTodaysPractice({
      journal,
      composePhraseCount: getSavedComposePhrases().length,
      contextLessonCount: getSavedContextTranslationLessons().length,
    });
  }, [clientReady, journal]);

  return (
    <div className="home-ws">
      <section className="home-ws__hero" aria-label="Learning journey">
        {continueMeta ? <HomeWorkspaceContinue meta={continueMeta} /> : null}
        <HomeWorkspaceMetrics metrics={metrics} streak={streak} />
      </section>

      <HomeWorkspaceFeaturedCollection feature={featuredCollection} />
      <HomeWorkspaceTodaysPractice cards={todaysPractice} />
      <HomeWorkspaceExploration
        savedWordCount={savedWordCount}
        explorationCount={explorationCount}
      />
      <HomeWorkspaceMotivation
        metrics={metrics}
        streak={streak}
        continueHref={continueMeta?.href ?? null}
      />
      <HomeWorkspaceRecommendedReading texts={recommendedTexts} />
    </div>
  );
}
