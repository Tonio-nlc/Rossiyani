"use client";

import { useEffect, useMemo, useState } from "react";

import {
  EditorialCard,
  GhostButton,
  PrimaryButton,
  SectionHeader,
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

function ContinueReadingSection({
  entry,
  editorialNote,
}: {
  entry: SessionJournalEntry;
  editorialNote: string;
}) {
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
            <p className="editorial-intro text-sm">{editorialNote}</p>
            <PrimaryButton href={entry.href ?? "/library"}>Continuer la lecture</PrimaryButton>
          </div>
        }
      />
    </section>
  );
}

function ContinueReadingEmpty() {
  return (
    <section className="editorial-page-section space-y-4" aria-label="Continuer la lecture">
      <SectionHeader
        eyebrow="Continuer la lecture"
        title="Commencez votre fil de session"
        description="Importez un texte pour ouvrir une session de lecture, d'exploration et de mémorisation."
      />
      <PrimaryButton href="/import">Importer un texte</PrimaryButton>
    </section>
  );
}

function TodaySection({ entries }: { entries: SessionJournalEntry[] }) {
  if (entries.length === 0) {
    return (
      <section className="editorial-page-section">
        <SectionHeader
          eyebrow="Aujourd'hui"
          title="Vos découvertes du jour"
          description="Lisez, explorez ou enregistrez un mot — vos découvertes apparaîtront ici."
        />
      </section>
    );
  }

  return (
    <section className="editorial-page-section space-y-4" aria-label="Aujourd'hui">
      <SectionHeader
        eyebrow="Aujourd'hui"
        title="Ce que vous venez d'apprendre"
        description="Découvertes récentes issues de votre lecture et de votre exploration."
      />
      <div className="library-editorial-grid">
        {entries.map((entry, index) => (
          <EditorialCard
            key={`${entry.label}-${entry.href ?? index}`}
            href={entry.href}
            featured={index === 0}
            title={entry.label}
            meta={entry.detail}
            footer={
              entry.href ? (
                <GhostButton href={entry.href}>Explorer →</GhostButton>
              ) : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}

function ReviewSection({ entries }: { entries: SessionJournalEntry[] }) {
  const visible = entries.slice(0, REVIEW_LIMIT);

  return (
    <section className="editorial-page-section space-y-4" aria-label="À revoir">
      <SectionHeader
        eyebrow="À revoir"
        title="File de révision"
        description={
          visible.length > 0
            ? "Mots et notions à consolider avant votre prochaine lecture."
            : "Rien en attente pour l'instant."
        }
      />
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

function RecommendedPracticeSection({
  step,
  rationale,
}: {
  step: SessionJournalEntry;
  rationale: string | null;
}) {
  return (
    <section className="editorial-page-section space-y-4" aria-label="Pratique recommandée">
      <SectionHeader
        eyebrow="Pratique recommandée"
        title="Prochaine étape"
        description="Une action concrète pour prolonger votre session."
      />
      <EditorialCard
        href={step.href ?? "/practice"}
        featured
        title={step.label}
        meta={step.detail}
        footer={
          <div className="space-y-4">
            {rationale ? (
              <p className="editorial-intro text-sm italic text-[var(--ink-muted)]">{rationale}</p>
            ) : null}
            <PrimaryButton href={step.href ?? "/practice"}>Commencer</PrimaryButton>
          </div>
        }
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
  const nextRationale = narrative.why[0] ?? null;
  const heroNote = narrative.continueReading
    ? heroEditorialNote(narrative.continueReading, narrative.why)
    : "";

  return (
    <div className="pb-8">
      <header className="editorial-page-section pb-0">
        <SectionHeader
          eyebrow="Accueil"
          title="Votre session"
          description="Reprenez votre lecture, consolidez ce que vous venez d'apprendre, avancez pas à pas."
        />
      </header>

      {narrative.continueReading ? (
        <ContinueReadingSection entry={narrative.continueReading} editorialNote={heroNote} />
      ) : (
        <ContinueReadingEmpty />
      )}

      <TodaySection entries={today} />

      <ReviewSection entries={narrative.toReview} />

      {narrative.nextStep ? (
        <RecommendedPracticeSection step={narrative.nextStep} rationale={nextRationale} />
      ) : null}
    </div>
  );
}
