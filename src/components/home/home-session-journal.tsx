"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

import { HomeJournalChapter } from "./home-journal-chapter";

type HomeSessionJournalProps = {
  journal: HomeJournalData;
  texts: TextListItem[];
};

export function HomeSessionJournal({ journal, texts }: HomeSessionJournalProps) {
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

  return (
    <div className="pb-[var(--space-2)]">
      <header className="pb-10 pt-[var(--space-3)]">
        <p className="home-section-label">Dashboard</p>
        <h1 className="mt-2 font-reader text-[clamp(1.5rem,3vw,1.875rem)] leading-tight tracking-tight text-[var(--ink)]">
          Journal de session
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink-secondary)]">
          Votre fil d&apos;apprentissage — lecture, découvertes, révisions et prochaine étape.
        </p>
      </header>

      <div className="space-y-0">
        {narrative.continueReading ? (
          <HomeJournalChapter
            title="Tu continues :"
            entries={[narrative.continueReading]}
            primary
          />
        ) : (
          <HomeJournalChapter
            title="Tu continues :"
            entries={[]}
            emptyMessage="Importez un texte pour commencer votre fil de lecture."
            primary
          />
        )}

        <div className="pt-8">
          <HomeJournalChapter
            title="Tu viens d'apprendre :"
            entries={narrative.recentlyLearned}
            emptyMessage={
              journal.todaysDiscovery
                ? `Commencez par explorer ${journal.todaysDiscovery.displayLabel} — votre première trace apparaîtra ici.`
                : "Lisez, explorez ou enregistrez un mot — votre session prendra forme ici."
            }
          />
        </div>

        <div className="pt-8">
          <HomeJournalChapter
            title="Tu dois revoir :"
            entries={narrative.toReview}
            emptyMessage="Aucun mot en attente — votre prochaine lecture alimentera cette section."
          />
        </div>

        <div className="pt-8">
          {narrative.nextStep ? (
            <HomeJournalChapter title="Prochaine étape :" entries={[narrative.nextStep]} />
          ) : null}
        </div>

        {narrative.why.length > 0 ? (
          <section className="border-b border-[var(--hairline)] pb-8 pt-8">
            <h2 className="font-reader text-[clamp(1.125rem,2vw,1.25rem)] leading-snug text-[var(--ink)]">
              Pourquoi :
            </h2>
            <ul className="mt-4 space-y-2">
              {narrative.why.map((line) => (
                <li key={line} className="text-sm leading-relaxed text-[var(--ink-muted)]">
                  {line}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {!narrative.continueReading ? (
        <Link
          href="/import"
          className="focus-kb mt-6 inline-block text-sm text-[var(--ink-secondary)] hover:text-[var(--ink)]"
        >
          Importer un texte →
        </Link>
      ) : null}
    </div>
  );
}
