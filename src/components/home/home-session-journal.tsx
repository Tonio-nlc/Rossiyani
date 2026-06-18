"use client";

import Link from "next/link";
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

function parseHeroPercent(detail?: string): number | null {
  if (!detail) {
    return null;
  }
  const match = detail.match(/(\d+)\s*%/);
  return match ? Number.parseInt(match[1]!, 10) : null;
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

function EditorialEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="home-section-label">{children}</p>;
}

function ContinueHero({ entry }: { entry: SessionJournalEntry }) {
  const percent = parseHeroPercent(entry.detail);

  return (
    <section className="home-magazine-hero">
      <EditorialEyebrow>Continuer la lecture</EditorialEyebrow>

      <h1 className="home-magazine-hero-title break-russian mt-8 font-reader text-[var(--ink)]">
        {entry.label}
      </h1>

      {percent != null ? (
        <p className="home-magazine-hero-progress mt-6 font-reader tabular-nums text-[var(--ink)]">
          {percent}
          <span className="text-[0.45em] font-normal tracking-normal text-[var(--ink-muted)]">
            {" "}
            %
          </span>
        </p>
      ) : null}

      <Link href={entry.href ?? "/library"} className="home-magazine-cta focus-kb mt-12">
        Continuer →
      </Link>
    </section>
  );
}

function ContinueHeroEmpty() {
  return (
    <section className="home-magazine-hero">
      <EditorialEyebrow>Continuer la lecture</EditorialEyebrow>
      <p className="mt-8 max-w-md font-reader text-[clamp(1.5rem,3vw,2rem)] leading-snug text-[var(--ink-secondary)]">
        Importez un texte pour commencer.
      </p>
      <Link href="/import" className="home-magazine-cta focus-kb mt-12">
        Importer un texte →
      </Link>
    </section>
  );
}

function TodaySection({ entries }: { entries: SessionJournalEntry[] }) {
  if (entries.length === 0) {
    return (
      <section className="home-magazine-section">
        <EditorialEyebrow>Aujourd&apos;hui</EditorialEyebrow>
        <p className="home-magazine-lede mt-8 max-w-lg text-[var(--ink-secondary)]">
          Lisez, explorez ou enregistrez un mot — vos découvertes apparaîtront ici.
        </p>
      </section>
    );
  }

  return (
    <section className="home-magazine-section">
      <EditorialEyebrow>Aujourd&apos;hui</EditorialEyebrow>

      <ul className="mt-10 space-y-10">
        {entries.map((entry, index) => (
          <li key={`${entry.label}-${entry.href ?? index}`}>
            {entry.href ? (
              <Link href={entry.href} className="focus-kb group block max-w-xl">
                <p
                  className={[
                    "break-russian font-reader leading-snug text-[var(--ink)] transition group-hover:text-[var(--color-link)]",
                    index === 0
                      ? "text-[clamp(1.375rem,3vw,1.75rem)]"
                      : "text-[clamp(1.125rem,2vw,1.375rem)] text-[var(--ink-secondary)] group-hover:text-[var(--color-link)]",
                  ].join(" ")}
                >
                  {entry.label}
                </p>
                {entry.detail ? (
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--ink-muted)]">
                    {entry.detail}
                  </p>
                ) : null}
              </Link>
            ) : (
              <div className="max-w-xl">
                <p className="break-russian font-reader text-[clamp(1.375rem,3vw,1.75rem)] leading-snug text-[var(--ink)]">
                  {entry.label}
                </p>
                {entry.detail ? (
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
                    {entry.detail}
                  </p>
                ) : null}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReviewSection({ entries }: { entries: SessionJournalEntry[] }) {
  const visible = entries.slice(0, REVIEW_LIMIT);

  if (visible.length === 0) {
    return (
      <section className="home-magazine-section">
        <EditorialEyebrow>À revoir</EditorialEyebrow>
        <p className="home-magazine-lede mt-8 max-w-lg text-[var(--ink-muted)]">
          Rien en attente pour l&apos;instant.
        </p>
      </section>
    );
  }

  return (
    <section className="home-magazine-section">
      <EditorialEyebrow>À revoir</EditorialEyebrow>

      <ul className="mt-8 flex flex-wrap gap-2.5">
        {visible.map((entry) => (
          <li key={`${entry.label}-${entry.href ?? entry.detail ?? ""}`}>
            {entry.href ? (
              <Link
                href={entry.href}
                className="focus-kb inline-flex items-center rounded-full border border-[var(--hairline)] px-4 py-2 font-reader text-sm text-[var(--ink)] transition hover:border-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                {entry.label}
              </Link>
            ) : (
              <span className="inline-flex items-center rounded-full border border-[var(--hairline)] px-4 py-2 font-reader text-sm text-[var(--ink-secondary)]">
                {entry.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function NextStepSection({
  step,
  rationale,
}: {
  step: SessionJournalEntry;
  rationale: string | null;
}) {
  return (
    <section className="home-magazine-section home-magazine-section-last">
      <EditorialEyebrow>Prochaine étape</EditorialEyebrow>

      <Link href={step.href ?? "/practice"} className="focus-kb group mt-10 block max-w-xl">
        <p className="font-reader text-[clamp(1.25rem,2.5vw,1.625rem)] leading-snug text-[var(--ink)] transition group-hover:text-[var(--color-link)]">
          {step.label} →
        </p>
      </Link>

      {rationale ? (
        <p className="home-magazine-rationale mt-5 max-w-lg text-sm leading-relaxed text-[var(--ink-muted)]">
          {rationale}
        </p>
      ) : null}
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
  const nextRationale = narrative.why[0] ?? null;

  return (
    <div className="home-magazine pb-16">
      {narrative.continueReading ? (
        <ContinueHero entry={narrative.continueReading} />
      ) : (
        <ContinueHeroEmpty />
      )}

      <TodaySection entries={today} />

      <ReviewSection entries={narrative.toReview} />

      {narrative.nextStep ? (
        <NextStepSection step={narrative.nextStep} rationale={nextRationale} />
      ) : null}
    </div>
  );
}
