import { getSavedSentences } from "@/lib/phrase-mining";
import { getSavedDiscoveries } from "@/lib/discovery/saved-discoveries";
import { getSavedReaderWords } from "@/lib/reader/saved-words";

import {
  buildExpressionReviewContent,
  buildGrammarReviewContent,
  buildVocabularyReviewContent,
  reviewSourceKey,
} from "./build-review-content";
import { applySrsReview, isDue } from "./srs";
import type { ReviewItemRecord, ReviewLogRecord, ReviewRating, ReviewSessionCard, ReviewStats } from "./types";
import { REVIEW_SESSION_LIMIT as SESSION_LIMIT } from "./types";

const STORAGE_KEY = "rossiyani:reviewStore";

type LocalReviewStore = {
  items: ReviewItemRecord[];
  logs: ReviewLogRecord[];
  lastSessionDate: string | null;
  streakDays: number;
  totalReviewTimeMs: number;
};

function isBrowser(): boolean {
  return typeof localStorage !== "undefined";
}

function emptyStore(): LocalReviewStore {
  return {
    items: [],
    logs: [],
    lastSessionDate: null,
    streakDays: 0,
    totalReviewTimeMs: 0,
  };
}

function loadStore(): LocalReviewStore {
  if (!isBrowser()) {
    return emptyStore();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyStore();
    }
    return { ...emptyStore(), ...(JSON.parse(raw) as LocalReviewStore) };
  } catch {
    return emptyStore();
  }
}

function saveStore(store: LocalReviewStore): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function seedLocalReviewItems(): void {
  const store = loadStore();
  const existing = new Set(store.items.map((item) => item.sourceKey));

  for (const word of getSavedReaderWords()) {
    const sourceKey = reviewSourceKey("vocabulary", word.id);
    if (existing.has(sourceKey)) {
      continue;
    }
    store.items.unshift(createNewItem("vocabulary", sourceKey, buildVocabularyReviewContent(word)));
    existing.add(sourceKey);
  }

  for (const discovery of getSavedDiscoveries()) {
    const sourceKey = reviewSourceKey("expression", discovery.id);
    if (existing.has(sourceKey)) {
      continue;
    }
    store.items.unshift(
      createNewItem("expression", sourceKey, buildExpressionReviewContent(discovery)),
    );
    existing.add(sourceKey);
  }

  for (const sentence of getSavedSentences()) {
    const sourceKey = reviewSourceKey("grammar", sentence.id);
    if (existing.has(sourceKey)) {
      continue;
    }
    store.items.unshift(
      createNewItem("grammar", sourceKey, buildGrammarReviewContent(sentence)),
    );
    existing.add(sourceKey);
  }

  saveStore(store);
}

function createNewItem(
  type: ReviewItemRecord["type"],
  sourceKey: string,
  content: ReviewItemRecord["content"],
): ReviewItemRecord {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    type,
    sourceKey,
    content,
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    state: "new",
    nextReviewAt: now,
    lastReviewedAt: null,
    suspended: false,
    createdAt: now,
  };
}

export function addLocalReviewItem(input: {
  type: ReviewItemRecord["type"];
  sourceKey: string;
  content: ReviewItemRecord["content"];
}): ReviewItemRecord {
  seedLocalReviewItems();
  const store = loadStore();
  const existing = store.items.find((item) => item.sourceKey === input.sourceKey);
  if (existing) {
    if (existing.suspended) {
      existing.suspended = false;
      existing.nextReviewAt = new Date().toISOString();
      saveStore(store);
    }
    return existing;
  }
  const item = createNewItem(input.type, input.sourceKey, input.content);
  store.items.unshift(item);
  saveStore(store);
  return item;
}

export function removeLocalReviewItem(sourceKey: string): boolean {
  const store = loadStore();
  const before = store.items.length;
  store.items = store.items.filter((item) => item.sourceKey !== sourceKey);
  saveStore(store);
  return store.items.length < before;
}

export function isInLocalReview(sourceKey: string): boolean {
  return loadStore().items.some((item) => item.sourceKey === sourceKey && !item.suspended);
}

export function getLocalDueCards(limit = SESSION_LIMIT): ReviewSessionCard[] {
  seedLocalReviewItems();
  const now = new Date();
  return loadStore()
    .items.filter((item) => isDue(item, now))
    .sort(
      (left, right) =>
        new Date(left.nextReviewAt).getTime() - new Date(right.nextReviewAt).getTime(),
    )
    .slice(0, limit)
    .map((item) => ({
      item,
      isNew: item.state === "new" && item.repetitions === 0,
    }));
}

export function submitLocalReviewAnswer(input: {
  itemId: string;
  rating: ReviewRating;
  timeMs?: number;
}): ReviewItemRecord | null {
  const store = loadStore();
  const index = store.items.findIndex((item) => item.id === input.itemId);
  if (index < 0) {
    return null;
  }

  const item = store.items[index]!;
  const next = applySrsReview(item, input.rating);
  const updated: ReviewItemRecord = { ...item, ...next };
  store.items[index] = updated;

  store.logs.unshift({
    id: crypto.randomUUID(),
    reviewItemId: item.id,
    rating: input.rating,
    reviewedAt: new Date().toISOString(),
    timeMs: input.timeMs ?? null,
  });

  const today = dayKey(new Date());
  if (store.lastSessionDate) {
    const yesterday = dayKey(new Date(Date.now() - 86_400_000));
    if (store.lastSessionDate === yesterday) {
      store.streakDays += 1;
    } else if (store.lastSessionDate !== today) {
      store.streakDays = 1;
    }
  } else {
    store.streakDays = 1;
  }
  store.lastSessionDate = today;
  store.totalReviewTimeMs += input.timeMs ?? 0;

  saveStore(store);
  return updated;
}

export function getLocalReviewStats(): ReviewStats {
  seedLocalReviewItems();
  const store = loadStore();
  const now = new Date();
  const today = dayKey(now);

  const dueToday = store.items.filter((item) => isDue(item, now) && !item.suspended).length;
  const newAvailable = store.items.filter((item) => item.state === "new" && !item.suspended).length;
  const mastered = store.items.filter((item) => item.state === "mastered").length;
  const reviewedToday = store.logs.filter((log) => log.reviewedAt.startsWith(today)).length;

  return {
    dueToday,
    newAvailable,
    mastered,
    total: store.items.filter((item) => !item.suspended).length,
    reviewedToday,
    streakDays: store.streakDays,
    totalReviewTimeMs: store.totalReviewTimeMs,
  };
}

export function exportLocalReviewStore(): LocalReviewStore {
  seedLocalReviewItems();
  return loadStore();
}

export function importLocalReviewStore(store: LocalReviewStore): void {
  saveStore(store);
}
