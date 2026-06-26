"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/design-system";
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
import { buildExplorationHubData } from "@/lib/home/build-exploration-hub";
import { buildHomeDashboardMetrics } from "@/lib/home/build-home-dashboard-metrics";
import { buildTodaysPractice } from "@/lib/home/build-todays-practice";
import {
  buildSessionJournal,
  buildSessionJournalFromServer,
  type SessionJournal,
} from "@/lib/home/build-session-journal";
import { getLearningStreakSnapshot } from "@/lib/home/learning-streak";
import { pickRecommendedTexts } from "@/lib/home/pick-recommended-texts";
import { resolveContinueReading } from "@/lib/home/resolve-continue-reading";
import { getAllReadingProgress } from "@/lib/reader/reading-progress";
import { getSavedReaderWords } from "@/lib/reader/saved-words";

import { HomeWorkspaceCollections } from "./home-workspace-collections";
import { HomeWorkspaceContinue } from "./home-workspace-continue";
import { HomeWorkspaceRecommendedReading } from "./home-workspace-recommended-reading";
import { HomeWorkspaceTodaysPractice } from "./home-workspace-todays-practice";
import { HomeWorkspaceVocabulary } from "./home-workspace-vocabulary";

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
      return { currentStreak: 0, wordsToday: 0 };
    }
    return getLearningStreakSnapshot(getExplorationHistory());
  }, [clientReady]);

  const metrics = useMemo(() => {
    if (!clientReady) {
      return { wordsExplored: 0, textsCompleted: 0, conceptsExplored: 0 };
    }
    return buildHomeDashboardMetrics({
      readingProgress: getAllReadingProgress(),
      exploration: getExplorationHistory(),
      savedWords: getSavedReaderWords(),
      streak: getLearningStreakSnapshot(getExplorationHistory()),
    });
  }, [clientReady]);

  const continueMeta = useMemo(
    () => resolveContinueReading(narrative, texts),
    [narrative, texts],
  );

  const readingProgress = useMemo(
    () => (clientReady ? getAllReadingProgress() : {}),
    [clientReady],
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

  const explorationHub = useMemo(() => {
    if (!clientReady) {
      return buildExplorationHubData({ savedWordCount: 0, exploration: [] });
    }
    return buildExplorationHubData({
      savedWordCount,
      exploration: getExplorationHistory(),
    });
  }, [clientReady, savedWordCount]);

  return (
    <div className="home-ws">
      <header className="lessons-hero home-ws-hero">
        <p className="r3-eyebrow lessons-hero__eyebrow">Espace d&apos;apprentissage</p>
        <h1 className="r3-hero-title lessons-hero__title">Rossiyani</h1>
        <p className="r3-lead lessons-hero__lead">
          Reprenez votre lecture, pratiquez un peu, explorez vos collections — sans tableau de bord,
          juste votre progression.
        </p>
        <div className="lessons-hero__metrics">
          {streak.currentStreak > 0 ? (
            <Badge tone="blue">
              {streak.currentStreak} jour{streak.currentStreak === 1 ? "" : "s"} de suite
            </Badge>
          ) : null}
          {metrics.wordsExplored > 0 ? (
            <Badge tone="neutral">{metrics.wordsExplored} mots explorés</Badge>
          ) : null}
          {metrics.textsCompleted > 0 ? (
            <Badge tone="green">{metrics.textsCompleted} textes terminés</Badge>
          ) : null}
          {streak.wordsToday > 0 ? (
            <Badge tone="violet">{streak.wordsToday} mots aujourd&apos;hui</Badge>
          ) : null}
        </div>
      </header>

      {continueMeta ? <HomeWorkspaceContinue meta={continueMeta} /> : null}
      <HomeWorkspaceTodaysPractice cards={todaysPractice} />
      <HomeWorkspaceCollections texts={texts} />
      <HomeWorkspaceRecommendedReading texts={recommendedTexts} />
      <HomeWorkspaceVocabulary hub={explorationHub} />
    </div>
  );
}
