"use client";

import { useEffect, useMemo, useState } from "react";

import { GhostButton, PrimaryButton, Tag } from "@/components/design-system";
import { LibraryCardProgress } from "@/components/library/library-card-progress";
import type { TodaysDiscovery } from "@/features/discovery";
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

const REVIEW_LIMIT = 5;

function textIdFromHref(href?: string): string | null {
  if (!href?.startsWith("/texts/")) {
    return null;
  }
  return href.slice("/texts/".length).split("/")[0] ?? null;
}

function NextActionSection({ step }: { step: SessionJournalEntry }) {
  return (
    <section className="editorial-page-section space-y-3 pb-0" aria-label="Prochaine action">
      <p className="text-eyebrow">Prochaine action</p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-reader text-[var(--ink)]">{step.label}</p>
        <PrimaryButton href={step.href ?? "/practice"}>Pratiquer →</PrimaryButton>
      </div>
      {step.detail ? <p className="text-metadata">{step.detail}</p> : null}
    </section>
  );
}

function DailyDiscoverySection({ discovery }: { discovery: TodaysDiscovery }) {
  return (
    <section className="editorial-page-section space-y-3 pb-0" aria-label="Découverte du jour">
      <p className="text-eyebrow">Découverte du jour</p>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="break-russian font-reader text-xl text-[var(--ink)]">
          {discovery.displayLabel}
        </p>
        <GhostButton href={discovery.explorerHref}>Explorer →</GhostButton>
      </div>
      {discovery.subtitle && discovery.subtitle !== "—" ? (
        <p className="text-metadata italic">&ldquo;{discovery.subtitle}&rdquo;</p>
      ) : null}
    </section>
  );
}

function WordOfDaySection({ entry }: { entry: SessionJournalEntry }) {
  return (
    <section className="editorial-page-section space-y-3 pb-0" aria-label="Mot du jour">
      <p className="text-eyebrow">Mot du jour</p>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="break-russian font-reader text-xl text-[var(--ink)]">{entry.label}</p>
        {entry.href ? (
          <GhostButton href={entry.href}>Explorer →</GhostButton>
        ) : (
          <Tag>{entry.label}</Tag>
        )}
      </div>
      {entry.detail ? <p className="text-metadata">{entry.detail}</p> : null}
    </section>
  );
}

function ContinueReadingSection({ entry }: { entry: SessionJournalEntry }) {
  const textId = textIdFromHref(entry.href);

  return (
    <section className="editorial-page-section space-y-3 pb-0" aria-label="En cours">
      <p className="text-eyebrow">En cours</p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-reader text-[var(--ink)]">{entry.label}</p>
          {entry.detail ? <p className="text-metadata">{entry.detail}</p> : null}
        </div>
        <GhostButton href={entry.href ?? "/library"}>Lire →</GhostButton>
      </div>
      {textId ? <LibraryCardProgress textId={textId} /> : null}
    </section>
  );
}

function ReviewSection({ entries }: { entries: SessionJournalEntry[] }) {
  const visible = entries.slice(0, REVIEW_LIMIT);

  if (visible.length === 0) {
    return null;
  }

  return (
    <section className="editorial-page-section space-y-3 pb-0" aria-label="À revoir">
      <p className="text-eyebrow">À revoir</p>
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
    </section>
  );
}

function QuickLinksSection({ narrative }: { narrative: SessionJournal }) {
  const continueHref = narrative.continueReading?.href ?? "/library";
  const reviewHref = narrative.toReview[0]?.href ?? "/practice";
  const practiceHref = narrative.nextStep?.href ?? "/practice";

  return (
    <nav className="editorial-page-section" aria-label="Raccourcis">
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        <li>
          <GhostButton href={continueHref}>Lire →</GhostButton>
        </li>
        <li>
          <GhostButton href="/explorer">Explorer →</GhostButton>
        </li>
        <li>
          <GhostButton href={reviewHref}>Réviser →</GhostButton>
        </li>
        <li>
          <GhostButton href={practiceHref}>Pratiquer →</GhostButton>
        </li>
      </ul>
    </nav>
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

  const wordOfDay = useMemo(() => {
    const recent = narrative.recentlyLearned[0];
    if (!recent) {
      return null;
    }
    if (
      journal.todaysDiscovery &&
      recent.label === journal.todaysDiscovery.displayLabel
    ) {
      return null;
    }
    return recent;
  }, [journal.todaysDiscovery, narrative.recentlyLearned]);

  return (
    <div className="pb-8">
      {narrative.nextStep ? <NextActionSection step={narrative.nextStep} /> : null}

      {journal.todaysDiscovery ? (
        <DailyDiscoverySection discovery={journal.todaysDiscovery} />
      ) : null}

      {wordOfDay ? <WordOfDaySection entry={wordOfDay} /> : null}

      {narrative.continueReading ? (
        <ContinueReadingSection entry={narrative.continueReading} />
      ) : null}

      <ReviewSection entries={narrative.toReview} />

      <QuickLinksSection narrative={narrative} />
    </div>
  );
}
