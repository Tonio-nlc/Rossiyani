import type { HomeJournalData } from "@/features/home";
import type { SessionJournalEntry } from "@/lib/home/build-session-journal";
import { explorationKindLabel, type ExplorationEntry } from "@/lib/explorer/exploration-history";

export type DiscoveryChipKind = "word" | "concept" | "grammar";

export type DiscoveryChip = {
  label: string;
  href: string;
  kind: DiscoveryChipKind;
  detail?: string;
};

function kindFromExploration(kind: ExplorationEntry["kind"]): DiscoveryChipKind {
  if (kind === "lemma") {
    return "word";
  }
  if (kind === "concept" || kind === "phrase") {
    return "concept";
  }
  return "grammar";
}

function kindFromJournalDetail(detail?: string): DiscoveryChipKind {
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

export function buildRecentDiscoveryChips(input: {
  exploration: ExplorationEntry[];
  recentlyLearned: SessionJournalEntry[];
  journal: HomeJournalData;
  limit?: number;
}): DiscoveryChip[] {
  const limit = input.limit ?? 12;
  const chips: DiscoveryChip[] = [];
  const seen = new Set<string>();

  const push = (chip: DiscoveryChip) => {
    const key = chip.label.trim().toLowerCase();
    if (!key || seen.has(key)) {
      return;
    }
    seen.add(key);
    chips.push(chip);
  };

  for (const entry of input.exploration) {
    push({
      label: entry.label,
      href: entry.href,
      kind: kindFromExploration(entry.kind),
      detail: explorationKindLabel(entry.kind),
    });
    if (chips.length >= limit) {
      return chips;
    }
  }

  for (const entry of input.recentlyLearned) {
    push({
      label: entry.label,
      href: entry.href ?? "/explorer",
      kind: kindFromJournalDetail(entry.detail),
      detail: entry.detail,
    });
    if (chips.length >= limit) {
      return chips;
    }
  }

  if (input.journal.todaysDiscovery) {
    push({
      label: input.journal.todaysDiscovery.displayLabel,
      href: input.journal.todaysDiscovery.explorerHref,
      kind: "concept",
      detail: input.journal.todaysDiscovery.typeLabel,
    });
  }

  for (const word of input.journal.review.words.slice(0, 4)) {
    push({
      label: word.label,
      href: word.href,
      kind: "word",
      detail: "Vocabulary",
    });
  }

  return chips.slice(0, limit);
}
