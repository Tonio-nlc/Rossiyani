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

import {
  HomeIconExplore,
  HomeIconManual,
  HomeIconPractice,
  HomeIconRead,
} from "./home-icons";
import { HomeWorkspaceContinue } from "./home-workspace-continue";
import { HomeWorkspaceExploration, type ExplorationCardData } from "./home-workspace-exploration";
import { HomeWorkspaceFeaturedCollection } from "./home-workspace-featured-collection";
import { HomeWorkspaceMetrics } from "./home-workspace-metrics";
import { HomeWorkspaceMotivation } from "./home-workspace-motivation";
import { HomeWorkspaceRecommendedReading } from "./home-workspace-recommended-reading";
import { HomeWorkspaceTodaysPractice } from "./home-workspace-todays-practice";

type HomeDashboardProps = {
  journal: HomeJournalData;
  texts: TextListItem[];
};

function countRecentConceptDiscoveries(exploration: ReturnType<typeof getExplorationHistory>): number {
  const conceptKinds = new Set(["concept", "case", "ending", "expression", "collocation"]);
  return exploration.filter((entry) => conceptKinds.has(entry.kind)).length;
}

export function HomeDashboard({ journal, texts }: HomeDashboardProps) {
  const [narrative, setNarrative] = useState<SessionJournal>(() =>
    buildSessionJournalFromServer(journal, texts),
  );
  const [clientReady, setClientReady] = useState(false);
  const [savedWordCount, setSavedWordCount] = useState(0);
  const [explorationCount, setExplorationCount] = useState(0);
  const [conceptDiscoveryCount, setConceptDiscoveryCount] = useState(0);

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
    setConceptDiscoveryCount(countRecentConceptDiscoveries(exploration));
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
      pickFeaturedCollection(
        texts,
        readingProgress,
        continueMeta?.collectionId ?? null,
        metrics.conceptsExplored,
      ),
    [texts, readingProgress, continueMeta?.collectionId, metrics.conceptsExplored],
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

  const explorationCards = useMemo((): ExplorationCardData[] => {
    const sentenceRemaining = Math.max(1, 5 - (getSavedComposePhrases().length % 5));
    const contextRemaining = Math.max(1, 4 - (getSavedContextTranslationLessons().length % 4));
    const practiceAvailable = clientReady ? sentenceRemaining + contextRemaining : 3;
    const conceptsWaiting = journal.review.words.length + journal.review.moreCount;
    const discoveries = clientReady ? conceptDiscoveryCount : 0;

    return [
      {
        href: "/practice",
        title: "Practice",
        metric: `${practiceAvailable} exercise${practiceAvailable === 1 ? "" : "s"} available`,
        cta: "Continue practicing →",
        Icon: HomeIconPractice,
        layout: "large",
        tone: "practice",
      },
      {
        href: "/explorer",
        title: "Explorer",
        metric: `${conceptsWaiting} concept${conceptsWaiting === 1 ? "" : "s"} waiting`,
        cta: "Explore concepts →",
        Icon: HomeIconExplore,
        layout: "medium",
        tone: "explorer",
      },
      {
        href: "/manual",
        title: "Manual",
        metric: "Grammar roadmap",
        cta: "Continue learning →",
        Icon: HomeIconManual,
        layout: "medium",
        tone: "manual",
      },
      {
        href: "/library?section=discoveries",
        title: "Saved Words",
        metric: `${savedWordCount} saved word${savedWordCount === 1 ? "" : "s"}`,
        cta: "Review words →",
        Icon: HomeIconRead,
        layout: "small",
        tone: "saved",
      },
      {
        href: "/explorer",
        title: "Recent Discoveries",
        metric: `${discoveries || explorationCount} new concept${(discoveries || explorationCount) === 1 ? "" : "s"}`,
        cta: "View history →",
        Icon: HomeIconExplore,
        layout: "small",
        tone: "discoveries",
      },
    ];
  }, [
    clientReady,
    conceptDiscoveryCount,
    explorationCount,
    journal.review.moreCount,
    journal.review.words.length,
    savedWordCount,
  ]);

  return (
    <div className="home-ws">
      <section className="home-ws__hero" aria-label="Learning journey">
        {continueMeta ? (
          <HomeWorkspaceContinue meta={continueMeta} wordsDiscovered={metrics.wordsExplored} />
        ) : null}
        <HomeWorkspaceMetrics metrics={metrics} streak={streak} />
      </section>

      <HomeWorkspaceFeaturedCollection feature={featuredCollection} />
      <HomeWorkspaceTodaysPractice cards={todaysPractice} />
      <HomeWorkspaceRecommendedReading texts={recommendedTexts} />
      <HomeWorkspaceExploration cards={explorationCards} />
      <HomeWorkspaceMotivation streak={streak} continueHref={continueMeta?.href ?? null} />
    </div>
  );
}
