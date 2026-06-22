export type ContextTranslationHistoryEntry = {
  id: string;
  sourceText: string;
  bestTranslation: string;
  completedAt: string;
};

const STORAGE_KEY = "rossiyani:contextTranslationHistory";
const MAX_ENTRIES = 20;

function isBrowser(): boolean {
  return typeof localStorage !== "undefined";
}

function loadHistory(): ContextTranslationHistoryEntry[] {
  if (!isBrowser()) {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as ContextTranslationHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistHistory(entries: ContextTranslationHistoryEntry[]): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function getContextTranslationHistory(): ContextTranslationHistoryEntry[] {
  return loadHistory();
}

export function appendContextTranslationHistory(
  sourceText: string,
  bestTranslation: string,
): ContextTranslationHistoryEntry {
  const trimmedSource = sourceText.trim();
  const trimmedTranslation = bestTranslation.trim();
  const existing = loadHistory();
  const duplicate =
    existing[0]?.sourceText === trimmedSource &&
    existing[0]?.bestTranslation === trimmedTranslation;

  if (duplicate) {
    return existing[0]!;
  }

  const entry: ContextTranslationHistoryEntry = {
    id: crypto.randomUUID(),
    sourceText: trimmedSource,
    bestTranslation: trimmedTranslation,
    completedAt: new Date().toISOString(),
  };

  persistHistory([entry, ...existing]);
  return entry;
}
