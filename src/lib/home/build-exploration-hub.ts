import { MANUAL_CURRICULUM_TOTAL } from "@/features/manual/constants";
import type { ExplorationEntry } from "@/lib/explorer/exploration-history";
import { getManualLessonVisitCount } from "@/lib/manual/manual-lesson-history";

export type RecentDiscoveryItem = {
  category: "concept" | "grammar" | "vocabulary";
  categoryLabel: string;
  label: string;
  href: string | null;
};

export type ExplorationHubData = {
  savedWordCount: number;
  manualProgress: {
    completed: number;
    total: number;
    percent: number;
  };
  recentDiscoveries: RecentDiscoveryItem[];
};

const GRAMMAR_KINDS = new Set<ExplorationEntry["kind"]>(["case", "ending"]);

function pickRecentDiscovery(
  entries: ExplorationEntry[],
  predicate: (entry: ExplorationEntry) => boolean,
): ExplorationEntry | null {
  return entries.find(predicate) ?? null;
}

function buildRecentDiscoveries(entries: ExplorationEntry[]): RecentDiscoveryItem[] {
  const concept = pickRecentDiscovery(entries, (entry) => entry.kind === "concept");
  const grammar = pickRecentDiscovery(entries, (entry) => GRAMMAR_KINDS.has(entry.kind));
  const vocabulary = pickRecentDiscovery(entries, (entry) => entry.kind === "lemma");

  return [
    {
      category: "concept",
      categoryLabel: "Last concept",
      label: concept?.label ?? "No concepts yet",
      href: concept?.href ?? null,
    },
    {
      category: "grammar",
      categoryLabel: "Recent grammar",
      label: grammar?.label ?? "No grammar yet",
      href: grammar?.href ?? null,
    },
    {
      category: "vocabulary",
      categoryLabel: "Recent vocabulary",
      label: vocabulary?.label ?? "No vocabulary yet",
      href: vocabulary?.href ?? null,
    },
  ];
}

export function buildExplorationHubData(input: {
  savedWordCount: number;
  exploration: ExplorationEntry[];
}): ExplorationHubData {
  const completed = getManualLessonVisitCount();
  const total = MANUAL_CURRICULUM_TOTAL;
  const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  return {
    savedWordCount: input.savedWordCount,
    manualProgress: { completed, total, percent },
    recentDiscoveries: buildRecentDiscoveries(input.exploration),
  };
}
