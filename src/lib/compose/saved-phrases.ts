import type { SavedComposePhrase } from "./types";

const STORAGE_KEY = "rossiyani:composePhrases";
const MAX_ENTRIES = 100;

function isBrowser(): boolean {
  return typeof localStorage !== "undefined";
}

function loadPhrases(): SavedComposePhrase[] {
  if (!isBrowser()) {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as SavedComposePhrase[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePhrases(phrases: SavedComposePhrase[]): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(phrases.slice(0, MAX_ENTRIES)));
}

export function getSavedComposePhrases(): SavedComposePhrase[] {
  return loadPhrases();
}

export function saveComposePhrase(
  phrase: Omit<SavedComposePhrase, "id" | "savedAt">,
): SavedComposePhrase {
  const entry: SavedComposePhrase = {
    ...phrase,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };
  savePhrases([entry, ...loadPhrases()]);
  return entry;
}

export function deleteComposePhrase(id: string): void {
  savePhrases(loadPhrases().filter((phrase) => phrase.id !== id));
}

export function getComposePhraseById(id: string): SavedComposePhrase | null {
  return loadPhrases().find((phrase) => phrase.id === id) ?? null;
}
