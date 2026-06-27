import { isLearnableLemma } from "@/lib/linguistics/lexical-metadata";

const STORAGE_KEY = "rossiyani:readerSavedWords";
const MAX_ENTRIES = 200;

export type SavedReaderWord = {
  id: string;
  displayForm: string;
  lemma: string | null;
  textId: string;
  savedAt: string;
  isProperNoun?: boolean | null;
};

function isBrowser(): boolean {
  return typeof localStorage !== "undefined";
}

function loadWords(): SavedReaderWord[] {
  if (!isBrowser()) {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as SavedReaderWord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveWords(words: SavedReaderWord[]): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words.slice(0, MAX_ENTRIES)));
}

function wordKey(displayForm: string, textId: string): string {
  return `${textId}:${displayForm.trim().toLowerCase()}`;
}

export function isReaderWordSaved(displayForm: string, textId: string): boolean {
  const key = wordKey(displayForm, textId);
  return loadWords().some((entry) => wordKey(entry.displayForm, entry.textId) === key);
}

export function saveReaderWord(input: {
  displayForm: string;
  lemma: string | null;
  textId: string;
  isProperNoun?: boolean | null;
}): SavedReaderWord | null {
  if (!isLearnableLemma({ isProperNoun: input.isProperNoun })) {
    return null;
  }
  const key = wordKey(input.displayForm, input.textId);
  const existing = loadWords().filter(
    (entry) => wordKey(entry.displayForm, entry.textId) !== key,
  );
  const entry: SavedReaderWord = {
    id: crypto.randomUUID(),
    displayForm: input.displayForm,
    lemma: input.lemma,
    textId: input.textId,
    savedAt: new Date().toISOString(),
    isProperNoun: input.isProperNoun ?? false,
  };
  saveWords([entry, ...existing]);
  return entry;
}

export function getSavedReaderWords(): SavedReaderWord[] {
  return loadWords().filter((entry) => isLearnableLemma({ isProperNoun: entry.isProperNoun }));
}
