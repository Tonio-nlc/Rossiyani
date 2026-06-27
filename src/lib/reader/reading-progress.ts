import { countLearnableWordsSeen } from "@/lib/linguistics/lexical-metadata";

const STORAGE_KEY = "rossiyani:readingProgress";

export type TextReadingProgress = {
  textId: string;
  lastSentenceId: string;
  lastWordId: string | null;
  wordsSeenIds: string[];
  /** Subset of wordsSeenIds excluding proper nouns — used for vocabulary stats. */
  learnableWordsSeenIds?: string[];
  sentencesSeenIds: string[];
  totalWords: number;
  percent: number;
  readingTimeMs: number;
  lastReadAt: string;
};

function isBrowser(): boolean {
  return typeof localStorage !== "undefined";
}

function loadStore(): Record<string, TextReadingProgress> {
  if (!isBrowser()) {
    return {};
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as Record<string, TextReadingProgress>;
  } catch {
    return {};
  }
}

function saveStore(store: Record<string, TextReadingProgress>): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function clearTextReadingProgress(textId: string): void {
  if (!isBrowser()) {
    return;
  }
  const store = loadStore();
  if (!(textId in store)) {
    return;
  }
  delete store[textId];
  saveStore(store);
}

export function getTextReadingProgress(textId: string): TextReadingProgress | null {
  return loadStore()[textId] ?? null;
}

export function getAllReadingProgress(): Record<string, TextReadingProgress> {
  return loadStore();
}

export function getMostRecentReadingTextId(): string | null {
  const entries = Object.values(loadStore());
  if (entries.length === 0) {
    return null;
  }

  return [...entries].sort(
    (a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime(),
  )[0]!.textId;
}

function computePercent(wordsSeenCount: number, totalWords: number): number {
  if (totalWords <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((wordsSeenCount / totalWords) * 100));
}

export function upsertReadingProgress(input: {
  textId: string;
  lastSentenceId: string;
  lastWordId?: string | null;
  seenWordId?: string;
  seenWordLearnable?: boolean;
  seenSentenceId?: string;
  totalWords: number;
  readingTimeDeltaMs?: number;
}): TextReadingProgress {
  const store = loadStore();
  const existing = store[input.textId];
  const wordsSeen = new Set(existing?.wordsSeenIds ?? []);
  const learnableWordsSeen = new Set(existing?.learnableWordsSeenIds ?? []);
  const sentencesSeen = new Set(existing?.sentencesSeenIds ?? []);

  if (input.seenWordId) {
    wordsSeen.add(input.seenWordId);
    const trackAsLearnable = input.seenWordLearnable !== false;
    if (trackAsLearnable) {
      learnableWordsSeen.add(input.seenWordId);
    }
  }
  if (input.seenSentenceId) {
    sentencesSeen.add(input.seenSentenceId);
  }

  const totalWords = Math.max(input.totalWords, existing?.totalWords ?? 0);
  const readingTimeMs = (existing?.readingTimeMs ?? 0) + (input.readingTimeDeltaMs ?? 0);
  const wordsSeenIds = [...wordsSeen];
  const learnableWordsSeenIds = [...learnableWordsSeen];
  const sentencesSeenIds = [...sentencesSeen];
  const percent = computePercent(wordsSeenIds.length, totalWords);

  const progress: TextReadingProgress = {
    textId: input.textId,
    lastSentenceId: input.lastSentenceId,
    lastWordId: input.lastWordId ?? existing?.lastWordId ?? null,
    wordsSeenIds,
    learnableWordsSeenIds,
    sentencesSeenIds,
    totalWords,
    percent,
    readingTimeMs,
    lastReadAt: new Date().toISOString(),
  };

  store[input.textId] = progress;
  saveStore(store);
  return progress;
}

export { countLearnableWordsSeen };

export function estimateReadingMinutes(totalWords: number): number {
  if (totalWords <= 0) {
    return 0;
  }
  return Math.max(1, Math.ceil(totalWords / 120));
}

export function computeSentencePercent(
  sentencesSeenCount: number,
  totalSentences: number,
): number {
  if (totalSentences <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((sentencesSeenCount / totalSentences) * 100));
}

/** True when every sentence has been seen while reading (viewport intersection). */
export function isTextReadingComplete(
  progress: TextReadingProgress | null,
  totalSentences: number,
): boolean {
  if (!progress || totalSentences <= 0) {
    return false;
  }
  return progress.sentencesSeenIds.length >= totalSentences;
}

export function formatLastReadLabel(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (diffDays === 0) {
    return "Aujourd'hui";
  }
  if (diffDays === 1) {
    return "Hier";
  }

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function estimateRemainingMinutes(
  progress: TextReadingProgress | null,
  totalWords: number,
): number | null {
  if (!progress || progress.wordsSeenIds.length === 0) {
    return null;
  }

  const remaining = Math.max(0, totalWords - progress.wordsSeenIds.length);
  if (remaining === 0) {
    return 0;
  }

  const msPerWord =
    progress.readingTimeMs > 0
      ? progress.readingTimeMs / progress.wordsSeenIds.length
      : 4000;

  return Math.max(1, Math.ceil((remaining * msPerWord) / 60_000));
}

export function renderProgressBlocks(percent: number, blocks = 10): string {
  const filled = Math.round((percent / 100) * blocks);
  return `${"█".repeat(filled)}${"░".repeat(blocks - filled)}`;
}
