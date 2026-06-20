"use client";

import { useEffect, useMemo, useState } from "react";

import {
  EditorialCard,
  GhostButton,
  PrimaryButton,
  Tag,
} from "@/components/design-system";
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
  type SessionJournalEntry,
} from "@/lib/home/build-session-journal";
import { getAllReadingProgress } from "@/lib/reader/reading-progress";
import { getSavedReaderWords } from "@/lib/reader/saved-words";

type HomeSessionJournalProps = {
  journal: HomeJournalData;
  texts: TextListItem[];
};

const TODAY_LIMIT = 3;
const REVIEW_LIMIT = 5;

function textIdFromHref(href?: string): string | null {
  if (!href?.startsWith("/texts/")) {
    return null;
  }
  return href.slice("/texts/".length).split("/")[0] ?? null;
}

function todayEntries(
  narrative: SessionJournal,
  journal: HomeJournalData,
): SessionJournalEntry[] {
  const recent = narrative.recentlyLearned.slice(0, TODAY_LIMIT);
  if (recent.length > 0) {
    return recent;
  }

  if (journal.todaysDiscovery) {
    return [
      {
        label: journal.todaysDiscovery.displayLabel,
        detail: journal.todaysDiscovery.subtitle,
        href: journal.todaysDiscovery.explorerHref,
      },
    ];
  }

  return [];
}

function QuickNavSection({ narrative }: { narrative: SessionJournal }) {
  const continueHref = narrative.continueReading?.href ?? "/library";
  const reviewHref = narrative.toReview[0]?.href ?? "/practice";
  const practiceHref = narrative.nextStep?.href ?? "/practice";

  return (
    <nav className="editorial-page-section pb-0" aria-label="Actions rapides">
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        <li>
          <GhostButton href={continueHref}>📖 Continuer la lecture</GhostButton>
        </li>
        <li>
          <GhostButton href="/explorer">🔍 Explorer un mot</GhostButton>
        </li>
        <li>
          <GhostButton href={reviewHref}>🧠 Réviser</GhostButton>
        </li>
        <li>
          <GhostButton href={practiceHref}>✍️ Pratiquer</GhostButton>
        </li>
      </ul>
    </nav>
  );
}

function ContinueReadingSection({ entry }: { entry: SessionJournalEntry }) {
  const textId = textIdFromHref(entry.href);

  return (
    <section className="editorial-page-section space-y-4" aria-label="Continuer la lecture">
      <p className="text-eyebrow">Continuer la lecture</p>
      <EditorialCard
        href={entry.href ?? "/library"}
        featured
        eyebrow={entry.collectionName ?? "Lecture en cours"}
        title={entry.label}
        meta={entry.detail}
        footer={
          <div className="space-y-4">
            {textId ? <LibraryCardProgress textId={textId} /> : null}
            <PrimaryButton href={entry.href ?? "/library"}>Reprendre</PrimaryButton>
          </div>
        }
      />
    </section>
  );
}

function ContinueReadingEmpty() {
  return (
    <section className="editorial-page-section space-y-4" aria-label="Continuer la lecture">
      <p className="text-eyebrow">Continuer la lecture</p>
      <PrimaryButton href="/import">Importer un texte</PrimaryButton>
    </section>
  );
}

function TodaySection({ entries }: { entries: SessionJournalEntry[] }) {
  return (
    <section className="editorial-page-section space-y-4" aria-label="Aujourd'hui">
      <p className="text-eyebrow">Aujourd&apos;hui</p>
      {entries.length > 0 ? (
        <div className="library-editorial-grid">
          {entries.map((entry, index) => (
            <EditorialCard
              key={`${entry.label}-${entry.href ?? index}`}
              href={entry.href}
              featured={index === 0}
              title={entry.label}
              meta={entry.detail}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ReviewSection({ entries }: { entries: SessionJournalEntry[] }) {
  const visible = entries.slice(0, REVIEW_LIMIT);

  return (
    <section className="editorial-page-section space-y-4" aria-label="À revoir">
      <p className="text-eyebrow">À revoir</p>
      {visible.length > 0 ? (
        <ul className="flex flex-wrap gap-3">
          {visible.map((entry) => (
            <li key={`${entry.label}-${entry.href ?? entry.detail ?? ""}`}>
              {entry.href ? (
                <GhostButton href={entry.href}>{entry.label}</GhostButton>
              ) : (
                <Tag>{entry.label}</Tag>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function RecommendedPracticeSection({ step }: { step: SessionJournalEntry }) {
  return (
    <section className="editorial-page-section space-y-4" aria-label="Prochaine étape">
      <p className="text-eyebrow">Prochaine étape</p>
      <EditorialCard
        href={step.href ?? "/practice"}
        featured
        title={step.label}
        meta={step.detail}
        footer={<PrimaryButton href={step.href ?? "/practice"}>Commencer</PrimaryButton>}
      />
    </section>
  );
}

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

  const today = useMemo(() => todayEntries(narrative, journal), [narrative, journal]);

  return (
    <div className="pb-8">
      <QuickNavSection narrative={narrative} />

      {narrative.continueReading ? (
        <ContinueReadingSection entry={narrative.continueReading} />
      ) : (
        <ContinueReadingEmpty />
      )}

      <TodaySection entries={today} />

      <ReviewSection entries={narrative.toReview} />

      {narrative.nextStep ? (
        <RecommendedPracticeSection step={narrative.nextStep} />
      ) : null}
    </div>
  );
}
