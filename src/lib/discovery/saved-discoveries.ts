import type { TodaysDiscovery } from "@/features/discovery";

const ARCHIVE_KEY = "rossiyani:discoveryArchive";
const SAVED_KEY = "rossiyani:savedDiscoveries";
const LEGACY_HISTORY_KEY = "rossiyani:discoveryHistory";
const MAX_ARCHIVE = 365;
const MAX_SAVED = 50;

export type DiscoveryArchiveEntry = TodaysDiscovery & {
  archivedAt: string;
};

export type SavedDiscovery = TodaysDiscovery & {
  savedAt: string;
};

/** @deprecated Use DiscoveryArchiveEntry */
export type DiscoveryHistoryEntry = {
  candidateId: string;
  dateKey: string;
};

function isBrowser(): boolean {
  return typeof localStorage !== "undefined";
}

function loadArchive(): DiscoveryArchiveEntry[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DiscoveryArchiveEntry[];
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    const legacy = localStorage.getItem(LEGACY_HISTORY_KEY);
    if (!legacy) {
      return [];
    }

    const legacyParsed = JSON.parse(legacy) as DiscoveryHistoryEntry[];
    return Array.isArray(legacyParsed)
      ? legacyParsed.map((entry) => ({
          id: entry.candidateId,
          dateKey: entry.dateKey,
          archivedAt: `${entry.dateKey}T12:00:00.000Z`,
          type: "WORD" as const,
          typeLabel: "Word",
          displayLabel: "…",
          subtitle: "—",
          explanation: "",
          exampleRussian: "",
          exampleTranslation: "",
          difficulty: "B1" as const,
          register: "neutral" as const,
          topics: [],
          explorerHref: "/vocabulary",
          practiceHref: "/practice",
          readExamplesHref: "/vocabulary",
          partOfSpeech: null,
        }))
      : [];
  } catch {
    return [];
  }
}

function saveArchive(entries: DiscoveryArchiveEntry[]): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(entries.slice(0, MAX_ARCHIVE)));
}

export function getDiscoveryArchive(): DiscoveryArchiveEntry[] {
  return loadArchive();
}

export function recordDiscoveryArchive(discovery: TodaysDiscovery): void {
  if (!isBrowser()) {
    return;
  }

  const entry: DiscoveryArchiveEntry = {
    ...discovery,
    archivedAt: new Date().toISOString(),
  };

  const deduped = loadArchive().filter((item) => item.dateKey !== discovery.dateKey);
  saveArchive([entry, ...deduped]);
}

/** @deprecated Use getDiscoveryArchive */
export function getDiscoveryHistory(): DiscoveryHistoryEntry[] {
  return getDiscoveryArchive().map((entry) => ({
    candidateId: entry.id,
    dateKey: entry.dateKey,
  }));
}

/** @deprecated Use recordDiscoveryArchive */
export function recordDiscoveryHistory(candidateId: string, dateKey: string): void {
  void candidateId;
  void dateKey;
}

export function getSavedDiscoveries(): SavedDiscovery[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as SavedDiscovery[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isDiscoverySaved(id: string): boolean {
  return getSavedDiscoveries().some((entry) => entry.id === id);
}

export function saveDiscovery(discovery: TodaysDiscovery): SavedDiscovery {
  const entry: SavedDiscovery = {
    ...discovery,
    savedAt: new Date().toISOString(),
  };

  if (!isBrowser()) {
    return entry;
  }

  const deduped = getSavedDiscoveries().filter((item) => item.id !== discovery.id);
  localStorage.setItem(SAVED_KEY, JSON.stringify([entry, ...deduped].slice(0, MAX_SAVED)));
  return entry;
}

export function formatArchiveDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year!, month! - 1, day!);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
}
