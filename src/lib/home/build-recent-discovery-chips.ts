import type { HomeJournalData } from "@/features/home";
import type { SessionJournalEntry } from "@/lib/home/build-session-journal";
import { explorationKindLabel, type ExplorationEntry } from "@/lib/explorer/exploration-history";

export type DiscoveryCardKind = "word" | "concept" | "grammar";

export type DiscoveryCard = {
  label: string;
  href: string;
  kind: DiscoveryCardKind;
  typeLabel: string;
};

/** @deprecated Use DiscoveryCard */
export type DiscoveryChip = DiscoveryCard;
export type DiscoveryChipKind = DiscoveryCardKind;

function kindFromExploration(kind: ExplorationEntry["kind"]): DiscoveryCardKind {
  if (kind === "lemma") {
    return "word";
  }
  if (kind === "concept" || kind === "phrase") {
    return "concept";
  }
  return "grammar";
}

function kindFromJournalDetail(detail?: string): DiscoveryCardKind {
  if (!detail) {
    return "concept";
  }
  const lower = detail.toLowerCase();
  if (lower.includes("grammaire") || lower.includes("cas") || lower.includes("morphologie")) {
    return "grammar";
  }
  if (lower.includes("mot") || lower.includes("lemme")) {
    return "word";
  }
  return "concept";
}

function typeLabelFromExploration(kind: ExplorationEntry["kind"]): string {
  switch (kind) {
    case "lemma":
      return "Vocabulary";
    case "phrase":
      return "Expression";
    case "concept":
      return "Grammar concept";
    case "case":
      return "Grammar case";
    case "ending":
      return "Morphology";
    case "text":
      return "Text";
    default:
      return explorationKindLabel(kind);
  }
}

function typeLabelFromJournalDetail(detail?: string, kind?: DiscoveryCardKind): string {
  if (detail?.trim()) {
    const lower = detail.toLowerCase();
    if (lower.includes("grammaire")) {
      return "Grammar";
    }
    if (lower.includes("cas")) {
      return "Grammar case";
    }
    if (lower.includes("morphologie")) {
      return "Morphology";
    }
    if (lower.includes("structure")) {
      return "Structure";
    }
    if (lower.includes("mot") || lower.includes("lemme")) {
      return "Vocabulary";
    }
    return detail;
  }
  if (kind === "word") {
    return "Vocabulary";
  }
  if (kind === "grammar") {
    return "Grammar";
  }
  return "Concept";
}

export function buildRecentDiscoveryCards(input: {
  exploration: ExplorationEntry[];
  recentlyLearned: SessionJournalEntry[];
  journal: HomeJournalData;
  limit?: number;
}): DiscoveryCard[] {
  const limit = input.limit ?? 8;
  const cards: DiscoveryCard[] = [];
  const seen = new Set<string>();

  const push = (card: DiscoveryCard) => {
    const key = card.label.trim().toLowerCase();
    if (!key || seen.has(key)) {
      return;
    }
    seen.add(key);
    cards.push(card);
  };

  for (const entry of input.exploration) {
    const kind = kindFromExploration(entry.kind);
    push({
      label: entry.label,
      href: entry.href,
      kind,
      typeLabel: typeLabelFromExploration(entry.kind),
    });
    if (cards.length >= limit) {
      return cards;
    }
  }

  for (const entry of input.recentlyLearned) {
    const kind = kindFromJournalDetail(entry.detail);
    push({
      label: entry.label,
      href: entry.href ?? "/explorer",
      kind,
      typeLabel: typeLabelFromJournalDetail(entry.detail, kind),
    });
    if (cards.length >= limit) {
      return cards;
    }
  }

  if (input.journal.todaysDiscovery) {
    push({
      label: input.journal.todaysDiscovery.displayLabel,
      href: input.journal.todaysDiscovery.explorerHref,
      kind: "concept",
      typeLabel: input.journal.todaysDiscovery.typeLabel,
    });
  }

  for (const word of input.journal.review.words.slice(0, 4)) {
    push({
      label: word.label,
      href: word.href,
      kind: "word",
      typeLabel: "Vocabulary",
    });
  }

  return cards.slice(0, limit);
}

/** @deprecated Use buildRecentDiscoveryCards */
export function buildRecentDiscoveryChips(
  input: Parameters<typeof buildRecentDiscoveryCards>[0],
): DiscoveryCard[] {
  return buildRecentDiscoveryCards(input);
}
