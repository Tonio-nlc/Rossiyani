const CULTURAL_NOTES_KEY = "rossiyani:contextTranslationCulturalNotes";
const CONCEPTS_KEY = "rossiyani:contextTranslationSavedConcepts";
const MAX_ENTRIES = 200;

export type SavedCulturalNote = {
  id: string;
  note: string;
  sourceSentence: string;
  savedAt: string;
};

export type SavedGrammarConcept = {
  id: string;
  label: string;
  href: string | null;
  sourceSentence: string;
  savedAt: string;
};

function isBrowser(): boolean {
  return typeof localStorage !== "undefined";
}

function loadJson<T>(key: string): T[] {
  if (!isBrowser()) {
    return [];
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistJson<T>(key: string, items: T[]): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(key, JSON.stringify(items.slice(0, MAX_ENTRIES)));
}

export function isCulturalNoteSaved(note: string, sourceSentence: string): boolean {
  const normalized = note.trim();
  const source = sourceSentence.trim();
  return loadJson<SavedCulturalNote>(CULTURAL_NOTES_KEY).some(
    (entry) => entry.note.trim() === normalized && entry.sourceSentence.trim() === source,
  );
}

export function saveCulturalNote(note: string, sourceSentence: string): SavedCulturalNote {
  const existing = loadJson<SavedCulturalNote>(CULTURAL_NOTES_KEY).find(
    (entry) =>
      entry.note.trim() === note.trim() && entry.sourceSentence.trim() === sourceSentence.trim(),
  );
  if (existing) {
    return existing;
  }

  const entry: SavedCulturalNote = {
    id: crypto.randomUUID(),
    note: note.trim(),
    sourceSentence: sourceSentence.trim(),
    savedAt: new Date().toISOString(),
  };
  persistJson(CULTURAL_NOTES_KEY, [entry, ...loadJson<SavedCulturalNote>(CULTURAL_NOTES_KEY)]);
  return entry;
}

export function isGrammarConceptSaved(label: string, sourceSentence: string): boolean {
  const normalized = label.trim().toLowerCase();
  const source = sourceSentence.trim();
  return loadJson<SavedGrammarConcept>(CONCEPTS_KEY).some(
    (entry) =>
      entry.label.trim().toLowerCase() === normalized &&
      entry.sourceSentence.trim() === source,
  );
}

export function saveGrammarConcept(
  label: string,
  href: string | null,
  sourceSentence: string,
): SavedGrammarConcept {
  const existing = loadJson<SavedGrammarConcept>(CONCEPTS_KEY).find(
    (entry) =>
      entry.label.trim().toLowerCase() === label.trim().toLowerCase() &&
      entry.sourceSentence.trim() === sourceSentence.trim(),
  );
  if (existing) {
    return existing;
  }

  const entry: SavedGrammarConcept = {
    id: crypto.randomUUID(),
    label: label.trim(),
    href,
    sourceSentence: sourceSentence.trim(),
    savedAt: new Date().toISOString(),
  };
  persistJson(CONCEPTS_KEY, [entry, ...loadJson<SavedGrammarConcept>(CONCEPTS_KEY)]);
  return entry;
}
