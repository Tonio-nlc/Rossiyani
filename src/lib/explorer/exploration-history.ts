const STORAGE_KEY = "rossiyani:explorerHistory";
const MAX_ENTRIES = 12;

export type ExplorationKind =
  | "concept"
  | "lemma"
  | "ending"
  | "case"
  | "phrase"
  | "text"
  | "page";

export type ExplorationEntry = {
  id: string;
  label: string;
  href: string;
  kind: ExplorationKind;
  visitedAt: string;
};

function isBrowser(): boolean {
  return typeof localStorage !== "undefined";
}

function loadEntries(): ExplorationEntry[] {
  if (!isBrowser()) {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as ExplorationEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: ExplorationEntry[]): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function getExplorationHistory(): ExplorationEntry[] {
  return loadEntries();
}

export function recordExploration(entry: Omit<ExplorationEntry, "visitedAt">): void {
  const visitedAt = new Date().toISOString();
  const next: ExplorationEntry = { ...entry, visitedAt };
  const deduped = loadEntries().filter((item) => item.href !== entry.href);
  saveEntries([next, ...deduped]);
}

export function explorationKindLabel(kind: ExplorationKind): string {
  switch (kind) {
    case "concept":
      return "Concept";
    case "lemma":
      return "Lemme";
    case "ending":
      return "Terminaison";
    case "case":
      return "Cas";
    case "phrase":
      return "Expression";
    case "text":
      return "Texte";
    default:
      return "Page";
  }
}
