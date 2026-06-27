"use client";

import { useEffect, useState } from "react";

import type { HomeJournalData } from "@/features/home";
import type { TextListItem } from "@/features/texts";
import { getExplorationHistory } from "@/lib/explorer/exploration-history";
import {
  buildHomeSessionViewModel,
  hasHomeProgress,
  type HomeSessionViewModel,
} from "@/lib/home/build-home-session";
import { getAllReadingProgress } from "@/lib/reader/reading-progress";

import { HomeWorkspaceCollections } from "./home-workspace-collections";
import { HomeWorkspaceContinue } from "./home-workspace-continue";
import { HomeWorkspaceDiscovery } from "./home-workspace-discovery";
import { HomeWorkspaceJourney } from "./home-workspace-journey";
import { HomeWorkspaceProgress } from "./home-workspace-progress";
import { HomeWorkspaceReview } from "./home-workspace-review";

type HomeDashboardProps = {
  journal: HomeJournalData;
  texts: TextListItem[];
};

const EMPTY_SESSION: HomeSessionViewModel = {
  userState: "first_launch",
  greeting: "Bienvenue",
  subtitle: "Chargement de votre session…",
  continueBlock: null,
  review: null,
  journey: [],
  discovery: null,
  progress: {
    textsCompleted: 0,
    wordsLearned: 0,
    cardsMastered: 0,
    currentStreak: 0,
  },
  collections: [],
};

export function HomeDashboard({ journal, texts }: HomeDashboardProps) {
  const [session, setSession] = useState<HomeSessionViewModel>(EMPTY_SESSION);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(
      buildHomeSessionViewModel({
        journal,
        texts,
        readingProgress: getAllReadingProgress(),
        exploration: getExplorationHistory(),
      }),
    );
    setReady(true);
  }, [journal, texts]);

  return (
    <div className="home-ws">
      <header className="home-ws-header">
        <p className="home-ws-header__eyebrow">Rossiyani</p>
        <h1 className="home-ws-header__title">{session.greeting}</h1>
        <p className="home-ws-header__lead">{session.subtitle}</p>
      </header>

      {session.continueBlock ? <HomeWorkspaceContinue block={session.continueBlock} /> : null}

      {ready && session.review ? <HomeWorkspaceReview review={session.review} /> : null}

      {ready ? <HomeWorkspaceJourney texts={session.journey} /> : null}

      <HomeWorkspaceDiscovery discovery={session.discovery} />

      {ready && hasHomeProgress(session.progress) ? (
        <HomeWorkspaceProgress progress={session.progress} />
      ) : null}

      {ready ? <HomeWorkspaceCollections collections={session.collections} /> : null}
    </div>
  );
}
