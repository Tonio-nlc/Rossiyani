"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { MediaImage } from "@/media";

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

function heroEditorialNote(entry: SessionJournalEntry, why: string[]): string {
  const contextual = why.find((line) => line.includes(entry.label));
  if (contextual) {
    return contextual;
  }

  if (entry.detail?.includes("pas encore")) {
    return "Commencez ce texte — votre session prendra forme au fil de la lecture.";
  }

  return "Reprenez le fil de votre session exactement où vous l'avez laissé.";
}

function HeroIllustration() {
  return (
    <div className="home-magazine-hero-art" aria-hidden>
      <MediaImage
        assetId="dashboard.hero"
        priority
        className="h-auto w-full max-w-full object-contain object-center"
        sizes="(min-width: 1024px) 42vw, 0px"
      />
    </div>
  );
}

function EditorialEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="home-section-label">{children}</p>;
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} prefetch className="home-magazine-primary-btn focus-kb">
      {children}
    </Link>
  );
}

function ContinueHero({
  entry,
  editorialNote,
}: {
  entry: SessionJournalEntry;
  editorialNote: string;
}) {
  return (
    <section className="home-magazine-hero">
      <div className="home-magazine-hero-grid">
        <div className="home-magazine-hero-copy min-w-0">
          <EditorialEyebrow>Continuer la lecture</EditorialEyebrow>

          <h1 className="home-magazine-hero-title break-russian mt-5 font-reader text-[var(--ink)]">
            {entry.label}
          </h1>

          {entry.detail ? (
            <p className="home-magazine-hero-subtitle mt-3 text-[var(--ink-secondary)]">
              {entry.detail}
            </p>
          ) : null}

          <p className="home-magazine-lede mt-5 max-w-md text-[var(--ink-muted)]">
            {editorialNote}
          </p>

          <div className="mt-8">
            <PrimaryButton href={entry.href ?? "/library"}>Continuer la lecture</PrimaryButton>
          </div>
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}

function ContinueHeroEmpty() {
  return (
    <section className="home-magazine-hero">
      <div className="home-magazine-hero-grid">
        <div className="home-magazine-hero-copy min-w-0">
          <EditorialEyebrow>Continuer la lecture</EditorialEyebrow>
          <p className="home-magazine-hero-title mt-5 font-reader leading-snug text-[var(--ink-secondary)]">
            Importez un texte pour commencer votre fil de lecture.
          </p>
          <p className="home-magazine-lede mt-5 max-w-md text-[var(--ink-muted)]">
            Rossiyani transforme chaque texte en session de compréhension, exploration et
            mémorisation.
          </p>
          <div className="mt-8">
            <PrimaryButton href="/import">Importer un texte</PrimaryButton>
          </div>
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}

function DiscoveryCard({ entry, featured }: { entry: SessionJournalEntry; featured?: boolean }) {
  const inner = (
    <>
      <p
        className={[
          "break-russian font-reader leading-snug text-[var(--ink)]",
          featured ? "text-xl" : "text-lg",
        ].join(" ")}
      >
        {entry.label}
      </p>
      {entry.detail ? (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--ink-muted)]">
          {entry.detail}
        </p>
      ) : null}
    </>
  );

  if (entry.href) {
    return (
      <Link
        href={entry.href}
        className={[
          "home-magazine-card focus-kb group block h-full transition hover:border-[var(--ink-muted)]",
          featured ? "home-magazine-card-featured" : "",
        ].join(" ")}
      >
        <div className="group-hover:text-[var(--color-link)]">{inner}</div>
        <span className="mt-4 inline-block text-sm text-[var(--ink-muted)] transition group-hover:text-[var(--color-link)]">
          Explorer →
        </span>
      </Link>
    );
  }

  return (
    <article
      className={[
        "home-magazine-card h-full",
        featured ? "home-magazine-card-featured" : "",
      ].join(" ")}
    >
      {inner}
    </article>
  );
}

function TodaySection({ entries }: { entries: SessionJournalEntry[] }) {
  if (entries.length === 0) {
    return (
      <section className="home-magazine-section">
        <EditorialEyebrow>Aujourd&apos;hui</EditorialEyebrow>
        <p className="home-magazine-lede mt-5 max-w-lg text-[var(--ink-secondary)]">
          Lisez, explorez ou enregistrez un mot — vos découvertes apparaîtront ici.
        </p>
      </section>
    );
  }

  const [featured, ...rest] = entries;

  return (
    <section className="home-magazine-section">
      <EditorialEyebrow>Aujourd&apos;hui</EditorialEyebrow>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {featured ? (
          <div className="md:col-span-2 lg:col-span-1">
            <DiscoveryCard entry={featured} featured />
          </div>
        ) : null}
        {rest.map((entry, index) => (
          <DiscoveryCard key={`${entry.label}-${entry.href ?? index}`} entry={entry} />
        ))}
      </div>
    </section>
  );
}

function ReviewSection({ entries }: { entries: SessionJournalEntry[] }) {
  const visible = entries.slice(0, REVIEW_LIMIT);

  if (visible.length === 0) {
    return (
      <section className="home-magazine-section">
        <EditorialEyebrow>À revoir</EditorialEyebrow>
        <p className="home-magazine-lede mt-5 max-w-lg text-[var(--ink-muted)]">
          Rien en attente pour l&apos;instant.
        </p>
      </section>
    );
  }

  return (
    <section className="home-magazine-section">
      <EditorialEyebrow>À revoir</EditorialEyebrow>

      <ul className="mt-5 flex flex-wrap gap-2">
        {visible.map((entry) => (
          <li key={`${entry.label}-${entry.href ?? entry.detail ?? ""}`}>
            {entry.href ? (
              <Link
                href={entry.href}
                className="focus-kb inline-flex items-center rounded-full border border-[var(--hairline)] bg-[var(--surface)] px-4 py-2 font-reader text-sm text-[var(--ink)] transition hover:border-[var(--ink-muted)]"
              >
                {entry.label}
              </Link>
            ) : (
              <span className="inline-flex items-center rounded-full border border-[var(--hairline)] bg-[var(--surface)] px-4 py-2 font-reader text-sm text-[var(--ink-secondary)]">
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

      <Link
        href={step.href ?? "/practice"}
        className="home-magazine-card home-magazine-card-featured focus-kb group mt-5 block max-w-xl transition hover:border-[var(--ink-muted)]"
      >
        <p className="font-reader text-xl leading-snug text-[var(--ink)] transition group-hover:text-[var(--color-link)]">
          {step.label}
        </p>
        {step.detail ? (
          <p className="mt-2 text-sm text-[var(--ink-muted)]">{step.detail}</p>
        ) : null}
        {rationale ? (
          <p className="home-magazine-rationale mt-4 text-sm leading-relaxed text-[var(--ink-muted)]">
            {rationale}
          </p>
        ) : null}
        <span className="mt-5 inline-block text-sm font-medium text-[var(--ink)] transition group-hover:text-[var(--color-link)]">
          Commencer →
        </span>
      </Link>
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
  const heroNote = narrative.continueReading
    ? heroEditorialNote(narrative.continueReading, narrative.why)
    : "";

  return (
    <div className="home-magazine pb-12">
      {narrative.continueReading ? (
        <ContinueHero entry={narrative.continueReading} editorialNote={heroNote} />
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
