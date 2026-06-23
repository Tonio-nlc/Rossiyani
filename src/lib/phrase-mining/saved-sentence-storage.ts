import type { SavedSentence, SavedSentenceInput } from "@/types/saved-sentence";

const STORAGE_KEY = "rossiyani:savedSentences";
const LEGACY_KEY = "rossiyani:readerSavedSentences";
const MAX_ENTRIES = 200;

type LegacySavedReaderSentence = {
  id: string;
  russianText: string;
  textId: string;
  textTitle: string;
  savedAt: string;
  translation?: string;
  collection?: string;
};

function isBrowser(): boolean {
  return typeof localStorage !== "undefined";
}

function normalizeSentence(raw: Partial<SavedSentence> & { russianText?: string }): SavedSentence | null {
  const text = (raw.text ?? raw.russianText ?? "").trim();
  const sourceTextId = raw.sourceTextId?.trim();
  if (!text || !sourceTextId) {
    return null;
  }

  return {
    id: raw.id ?? crypto.randomUUID(),
    text,
    translation: raw.translation?.trim() ?? "",
    sourceTextId,
    sourceTextTitle: raw.sourceTextTitle?.trim() ?? "Texte sans titre",
    collection: raw.collection?.trim() ?? "",
    createdAt: raw.createdAt ?? new Date().toISOString(),
    reviewCount: raw.reviewCount ?? 0,
    lastReviewedAt: raw.lastReviewedAt ?? null,
    nextReviewAt: raw.nextReviewAt ?? null,
  };
}

function loadRaw(): SavedSentence[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return migrateLegacyStorage();
    }
    const parsed = JSON.parse(raw) as Array<Partial<SavedSentence> & { russianText?: string }>;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((entry) => normalizeSentence(entry))
      .filter((entry): entry is SavedSentence => entry !== null);
  } catch {
    return [];
  }
}

function migrateLegacyStorage(): SavedSentence[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (!legacyRaw) {
      return [];
    }

    const legacy = JSON.parse(legacyRaw) as LegacySavedReaderSentence[];
    if (!Array.isArray(legacy) || legacy.length === 0) {
      return [];
    }

    const migrated = legacy
      .map((entry) =>
        normalizeSentence({
          id: entry.id,
          text: entry.russianText,
          translation: entry.translation ?? "",
          sourceTextId: entry.textId,
          sourceTextTitle: entry.textTitle,
          collection: entry.collection ?? "",
          createdAt: entry.savedAt,
        }),
      )
      .filter((entry): entry is SavedSentence => entry !== null);

    persistSentences(migrated);
    localStorage.removeItem(LEGACY_KEY);
    return migrated;
  } catch {
    return [];
  }
}

function persistSentences(sentences: SavedSentence[]): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sentences.slice(0, MAX_ENTRIES)));
}

export function getSavedSentences(): SavedSentence[] {
  return loadRaw().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getSavedSentenceById(id: string): SavedSentence | null {
  return getSavedSentences().find((sentence) => sentence.id === id) ?? null;
}

export function isSavedSentence(text: string, sourceTextId: string): boolean {
  const normalized = text.trim();
  return getSavedSentences().some(
    (sentence) => sentence.text === normalized && sentence.sourceTextId === sourceTextId,
  );
}

export function saveSentence(input: SavedSentenceInput): SavedSentence {
  const existing = getSavedSentences();
  const duplicate = existing.find(
    (sentence) => sentence.text === input.text.trim() && sentence.sourceTextId === input.sourceTextId,
  );
  if (duplicate) {
    return duplicate;
  }

  const entry: SavedSentence = {
    ...input,
    text: input.text.trim(),
    translation: input.translation.trim(),
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    reviewCount: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
  };

  persistSentences([entry, ...existing]);
  return entry;
}

export function deleteSavedSentence(id: string): void {
  persistSentences(getSavedSentences().filter((sentence) => sentence.id !== id));
}

export function recordSentenceReview(id: string): void {
  const sentences = getSavedSentences();
  const now = new Date().toISOString();
  persistSentences(
    sentences.map((sentence) =>
      sentence.id === id
        ? {
            ...sentence,
            reviewCount: (sentence.reviewCount ?? 0) + 1,
            lastReviewedAt: now,
          }
        : sentence,
    ),
  );
}
