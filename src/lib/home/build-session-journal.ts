import type { HomeJournalData } from "@/features/home";
import type { LearningSignals } from "@/features/discovery";
import { countLearnableWordsSeen } from "@/lib/linguistics/lexical-metadata";
import { getCollectionName } from "@/content/collections";
import type { TextListItem } from "@/features/texts";
import type { SavedComposePhrase } from "@/lib/compose/types";
import type { DiscoveryArchiveEntry, SavedDiscovery } from "@/lib/discovery/saved-discoveries";
import { explorationKindLabel, type ExplorationEntry } from "@/lib/explorer/exploration-history";
import { isDisplayableLibraryText } from "@/lib/home/displayable-text";
import {
  continueReadingRationale,
  recommendedPracticeRationale,
} from "@/lib/home/session-rationale";
import { formatReviewState, getLocalDueCards } from "@/lib/review";
import type { SavedReaderWord } from "@/lib/reader/saved-words";
import {
  formatLastReadLabel,
  type TextReadingProgress,
} from "@/lib/reader/reading-progress";

export type SessionJournalEntry = {
  label: string;
  detail?: string;
  collectionName?: string;
  href?: string;
};

export type SessionJournal = {
  continueReading: SessionJournalEntry | null;
  recentlyLearned: SessionJournalEntry[];
  toReview: SessionJournalEntry[];
  nextStep: SessionJournalEntry | null;
  why: string[];
};

type TimedJournalEntry = {
  at: string;
  entry: SessionJournalEntry;
};

type BuildSessionJournalInput = {
  journal: HomeJournalData;
  texts: TextListItem[];
  signals: LearningSignals;
  savedWords: SavedReaderWord[];
  savedDiscoveries: SavedDiscovery[];
  exploration: ExplorationEntry[];
  discoveryArchive: DiscoveryArchiveEntry[];
  savedPhrases: SavedComposePhrase[];
  readingProgress: Record<string, TextReadingProgress>;
};

function textTitleById(texts: TextListItem[], textId: string): string | null {
  return texts.find((text) => text.id === textId)?.title ?? null;
}

function mostRecentTextId(
  readingProgress: Record<string, TextReadingProgress>,
): string | null {
  const entries = Object.values(readingProgress);
  if (entries.length === 0) {
    return null;
  }

  return [...entries].sort(
    (left, right) =>
      new Date(right.lastReadAt).getTime() - new Date(left.lastReadAt).getTime(),
  )[0]!.textId;
}
function resolveContinueText(
  texts: TextListItem[],
  recentTextId: string | null,
): TextListItem | null {
  const displayable = texts.filter(isDisplayableLibraryText);
  if (displayable.length === 0) {
    return null;
  }

  if (recentTextId) {
    return displayable.find((text) => text.id === recentTextId) ?? displayable[0]!;
  }

  return displayable[0]!;
}

function lemmaExplorerHref(lemma: string): string {
  return `/explorer?q=${encodeURIComponent(lemma)}`;
}

function collectRecentlyLearned(input: BuildSessionJournalInput): SessionJournalEntry[] {
  const timed: TimedJournalEntry[] = [];

  for (const word of input.savedWords) {
    const label = word.lemma?.trim() || word.displayForm.trim();
    const textTitle = textTitleById(input.texts, word.textId);
    timed.push({
      at: word.savedAt,
      entry: {
        label,
        detail: textTitle ? `Enregistré depuis ${textTitle}` : "Enregistré lors d'une lecture",
        href: word.lemma ? lemmaExplorerHref(word.lemma) : undefined,
      },
    });
  }

  for (const discovery of input.savedDiscoveries) {
    timed.push({
      at: discovery.savedAt,
      entry: {
        label: discovery.displayLabel,
        detail: `${discovery.typeLabel} · découverte sauvegardée`,
        href: discovery.explorerHref,
      },
    });
  }

  for (const visit of input.exploration) {
    timed.push({
      at: visit.visitedAt,
      entry: {
        label: visit.label,
        detail: explorationKindLabel(visit.kind),
        href: visit.href,
      },
    });
  }

  for (const archived of input.discoveryArchive) {
    timed.push({
      at: archived.archivedAt,
      entry: {
        label: archived.displayLabel,
        detail: `Découverte · ${archived.dateKey}`,
        href: archived.explorerHref,
      },
    });
  }

  for (const phrase of input.savedPhrases) {
    for (const structure of phrase.structures) {
      timed.push({
        at: phrase.savedAt,
        entry: {
          label: structure.label,
          detail: "Structure pratiquée",
          href: structure.href,
        },
      });
    }
  }

  const recentTextId = mostRecentTextId(input.readingProgress);
  const recentProgress = recentTextId ? input.readingProgress[recentTextId] : null;
  if (recentProgress && recentProgress.wordsSeenIds.length > 0) {
    const textTitle = textTitleById(input.texts, recentTextId!);
    const learnableCount = countLearnableWordsSeen(recentProgress);
    timed.push({
      at: recentProgress.lastReadAt,
      entry: {
        label: `${learnableCount} mot${learnableCount > 1 ? "s" : ""} exploré${learnableCount > 1 ? "s" : ""}`,
        detail: textTitle ? `Dans ${textTitle}` : "Lors de votre dernière lecture",
        href: `/texts/${recentTextId}`,
      },
    });
  }

  if (input.journal.todaysDiscovery) {
    const discovery = input.journal.todaysDiscovery;
    timed.push({
      at: `${discovery.dateKey}T18:00:00.000Z`,
      entry: {
        label: discovery.displayLabel,
        detail: `${discovery.typeLabel} · découverte du jour`,
        href: discovery.explorerHref,
      },
    });
  }

  timed.sort((left, right) => new Date(right.at).getTime() - new Date(left.at).getTime());

  const seen = new Set<string>();
  const entries: SessionJournalEntry[] = [];
  for (const item of timed) {
    const key = item.entry.label.trim().toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    entries.push(item.entry);
    if (entries.length >= 5) {
      break;
    }
  }

  return entries;
}

function collectToReview(input: BuildSessionJournalInput): SessionJournalEntry[] {
  const dueCards = getLocalDueCards(5);
  if (dueCards.length > 0) {
    return dueCards.map((card) => ({
      label: card.item.content.prompt,
      href: "/review",
      detail: formatReviewState(card.item.state),
    }));
  }

  const entries: SessionJournalEntry[] = [];
  const seen = new Set<string>();

  for (const word of input.journal.review.words) {
    const key = word.label.trim().toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    entries.push({
      label: word.label,
      href: word.href,
      detail: word.count ? `Vu ${word.count} fois · réactivation` : "Réactivation espacée",
    });
  }

  for (const saved of input.savedWords) {
    const label = (saved.lemma?.trim() || saved.displayForm.trim()).toUpperCase();
    const key = label.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    const textTitle = textTitleById(input.texts, saved.textId);
    entries.push({
      label,
      href: saved.lemma ? lemmaExplorerHref(saved.lemma) : undefined,
      detail: textTitle
        ? `Enregistré lors de ${textTitle}`
        : "Enregistré lors d'une lecture",
    });
    if (entries.length >= 5) {
      break;
    }
  }

  return entries.slice(0, 5);
}

function pickNextStep(
  input: BuildSessionJournalInput,
  continueReading: SessionJournalEntry | null,
  recentProgress: TextReadingProgress | null,
): SessionJournalEntry {
  if (
    continueReading?.href &&
    recentProgress &&
    recentProgress.percent > 0 &&
    recentProgress.percent < 100
  ) {
    return {
      label: continueReading.label,
      href: continueReading.href,
      detail: `${recentProgress.percent} % · reprendre la lecture`,
    };
  }

  const practice = input.journal.featuredPractice;
  return {
    label: practice.title,
    href: practice.href,
    detail: `${practice.estimatedMinutes} min · pratique recommandée`,
  };
}

function buildWhy(
  input: BuildSessionJournalInput,
  nextStep: SessionJournalEntry | null,
  continueText: TextListItem | null,
  recentProgress: TextReadingProgress | null,
): string[] {
  const lines: string[] = [];

  if (
    nextStep?.href &&
    continueText &&
    recentProgress &&
    recentProgress.percent > 0 &&
    recentProgress.percent < 100 &&
    nextStep.href === `/texts/${continueText.id}`
  ) {
    lines.push(
      continueReadingRationale(
        continueText.title,
        formatLastReadLabel(recentProgress.lastReadAt),
        recentProgress.percent,
      ),
    );
  } else {
    lines.push(
      recommendedPracticeRationale(
        input.journal.featuredPractice,
        input.journal.todaysDiscovery,
      ),
    );
  }

  const recentSaved = input.savedWords[0];
  if (recentSaved) {
    const textTitle = textTitleById(input.texts, recentSaved.textId);
    const wordLabel = recentSaved.lemma?.trim() || recentSaved.displayForm.trim();
    lines.push(
      textTitle
        ? `Basé sur ${wordLabel} rencontré dans ${textTitle}`
        : `Basé sur ${wordLabel} enregistré lors de votre lecture`,
    );
  }

  const recentExploration = input.exploration[0];
  if (recentExploration) {
    lines.push(`Suite à votre exploration de ${recentExploration.label}`);
  } else if (input.signals.exploredLemmas[0]) {
    lines.push(`Relié à ${input.signals.exploredLemmas[0]} dans votre historique`);
  }

  if (input.journal.todaysDiscovery && input.journal.featuredPractice.source === "discovery") {
    lines.push(`Prolonge la découverte · ${input.journal.todaysDiscovery.displayLabel}`);
  }

  const unique = [...new Set(lines.filter(Boolean))];
  return unique.slice(0, 3);
}

export function buildSessionJournal(input: BuildSessionJournalInput): SessionJournal {
  const recentTextId = mostRecentTextId(input.readingProgress);
  const continueText = resolveContinueText(input.texts, recentTextId);
  const recentProgress = recentTextId ? input.readingProgress[recentTextId] ?? null : null;

  let continueReading: SessionJournalEntry | null = null;
  if (continueText) {
    const progress = input.readingProgress[continueText.id] ?? recentProgress;
    const lastRead = progress ? formatLastReadLabel(progress.lastReadAt) : null;
    continueReading = {
      label: continueText.title,
      collectionName: getCollectionName(continueText.collectionId),
      href: `/texts/${continueText.id}`,
      detail:
        progress && progress.wordsSeenIds.length > 0
          ? `${progress.percent} % · dernière ouverture ${lastRead?.toLowerCase() ?? "récente"}`
          : `${continueText.level} · pas encore commencé`,
    };
  }

  const recentlyLearned = collectRecentlyLearned(input);
  const toReview = collectToReview(input);
  const nextStep = pickNextStep(input, continueReading, recentProgress);
  const why = buildWhy(input, nextStep, continueText, recentProgress);

  return {
    continueReading,
    recentlyLearned,
    toReview,
    nextStep,
    why,
  };
}

/** Server-safe journal with review and practice only — before client signals hydrate. */
export function buildSessionJournalFromServer(
  journal: HomeJournalData,
  texts: TextListItem[],
): SessionJournal {
  return buildSessionJournal({
    journal,
    texts,
    signals: {
      exploredLemmas: [],
      exploredConcepts: [],
      exploredPhrases: [],
      readTextIds: [],
      practiceStructures: [],
      savedPhraseTexts: [],
      recentTopics: [],
      discoveryArchive: [],
      recentManualLessonSlugs: [],
      featuredHistory: [],
    },
    savedWords: [],
    savedDiscoveries: [],
    exploration: [],
    discoveryArchive: [],
    savedPhrases: [],
    readingProgress: {},
  });
}
