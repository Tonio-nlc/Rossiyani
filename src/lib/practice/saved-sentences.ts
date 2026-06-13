export type SavedReaderSentence = {
  id: string;
  russianText: string;
  textId: string;
  textTitle: string;
  savedAt: string;
};

const STORAGE_KEY = "rossiyani:readerSavedSentences";
const MAX_ENTRIES = 100;

function isBrowser(): boolean {
  return typeof localStorage !== "undefined";
}

function loadSentences(): SavedReaderSentence[] {
  if (!isBrowser()) {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as SavedReaderSentence[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSentences(sentences: SavedReaderSentence[]): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sentences.slice(0, MAX_ENTRIES)));
}

export function getSavedReaderSentences(): SavedReaderSentence[] {
  return loadSentences();
}

export function saveReaderSentence(
  sentence: Omit<SavedReaderSentence, "id" | "savedAt">,
): SavedReaderSentence {
  const entry: SavedReaderSentence = {
    ...sentence,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };
  saveSentences([entry, ...loadSentences()]);
  return entry;
}

export function deleteReaderSentence(id: string): void {
  saveSentences(loadSentences().filter((sentence) => sentence.id !== id));
}
