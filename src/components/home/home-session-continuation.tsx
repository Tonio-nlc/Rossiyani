"use client";

import { useEffect, useMemo, useState } from "react";

import { GhostButton } from "@/components/design-system";
import { EditorialSectionHead } from "@/components/editorial/editorial-section-head";
import { LibraryCardProgress } from "@/components/library/library-card-progress";
import type { HomeJournalData } from "@/features/home";
import type { TextListItem } from "@/features/texts";
import { getSavedComposePhrases } from "@/lib/compose/saved-phrases";
import { buildLearningSignals } from "@/lib/discovery/build-learning-signals";
import {
  getDiscoveryArchive,
  getSavedDiscoveries,
} from "@/lib/discovery/saved-discoveries";
import { getExplorationHistory } from "@/lib/explorer/exploration-history";
import {
  buildSessionJournal,
  buildSessionJournalFromServer,
  type SessionJournal,
} from "@/lib/home/build-session-journal";
import { getAllReadingProgress } from "@/lib/reader/reading-progress";
import { getSavedReaderWords } from "@/lib/reader/saved-words";

import { HomeIconRead } from "./home-icons";

type HomeSessionContinuationProps = {
  journal: HomeJournalData;
  texts: TextListItem[];
};

function textIdFromHref(href?: string): string | null {
  if (!href?.startsWith("/texts/")) {
    return null;
  }
  return href.slice("/texts/".length).split("/")[0] ?? null;
}

export function HomeSessionContinuation({ journal, texts }: HomeSessionContinuationProps) {
  const [narrative, setNarrative] = useState<SessionJournal>(() =>
    buildSessionJournalFromServer(journal, texts),
  );

  useEffect(() => {
    setNarrative(
      buildSessionJournal({
        journal,
        texts,
        signals: buildLearningSignals(),
        savedWords: getSavedReaderWords(),
        savedDiscoveries: getSavedDiscoveries(),
        exploration: getExplorationHistory(),
        discoveryArchive: getDiscoveryArchive(),
        savedPhrases: getSavedComposePhrases(),
        readingProgress: getAllReadingProgress(),
      }),
    );
  }, [journal, texts]);

  const hasContent = useMemo(
    () =>
      Boolean(
        narrative.continueReading ||
          narrative.nextStep ||
          journal.todaysDiscovery ||
          narrative.toReview.length > 0,
      ),
    [journal.todaysDiscovery, narrative.continueReading, narrative.nextStep, narrative.toReview.length],
  );

  if (!hasContent) {
    return null;
  }

  const continueTextId = textIdFromHref(narrative.continueReading?.href);

  return (
    <section
      className="home-section home-section--continuation"
      aria-labelledby="home-session-heading"
    >
      <EditorialSectionHead
        id="home-session-heading"
        icon={<HomeIconRead className="editorial-section-head__icon" />}
        title="Continue your session"
        lead="Pick up where you left off."
      />

      <div className="home-session-panel">
        {narrative.continueReading ? (
          <div className="home-session-panel__row">
            <div className="home-session-panel__body">
              <p className="home-session-panel__label">Reading</p>
              <p className="home-session-panel__title">{narrative.continueReading.label}</p>
              {narrative.continueReading.detail ? (
                <p className="home-session-panel__detail">{narrative.continueReading.detail}</p>
              ) : null}
              {continueTextId ? <LibraryCardProgress textId={continueTextId} /> : null}
            </div>
            <GhostButton href={narrative.continueReading.href ?? "/library"}>
              Continue →
            </GhostButton>
          </div>
        ) : null}

        {narrative.nextStep ? (
          <div className="home-session-panel__row">
            <div className="home-session-panel__body">
              <p className="home-session-panel__label">Next</p>
              <p className="home-session-panel__title">{narrative.nextStep.label}</p>
              {narrative.nextStep.detail ? (
                <p className="home-session-panel__detail">{narrative.nextStep.detail}</p>
              ) : null}
            </div>
            <GhostButton href={narrative.nextStep.href ?? "/practice"}>Practice →</GhostButton>
          </div>
        ) : null}

        {journal.todaysDiscovery ? (
          <div className="home-session-panel__row">
            <div className="home-session-panel__body">
              <p className="home-session-panel__label">Today&apos;s discovery</p>
              <p className="home-session-panel__title break-russian">
                {journal.todaysDiscovery.displayLabel}
              </p>
            </div>
            <GhostButton href={journal.todaysDiscovery.explorerHref}>Explore →</GhostButton>
          </div>
        ) : null}
      </div>
    </section>
  );
}
