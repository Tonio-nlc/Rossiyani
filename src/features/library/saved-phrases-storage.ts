export type SavedPhraseStructure = {
  label: string;
  href: string;
};

export type SavedPhraseRewriteType = "natural" | "conversational" | "literary" | "alternative";

export type SavedPhrase = {
  id: string;
  originalSentence: string;
  rewrittenSentence: string;
  rewriteType: SavedPhraseRewriteType;
  explanation: string;
  structures: SavedPhraseStructure[];
  createdAt: string;
  source: "practice" | "context-translation";
};

export type SavePhraseInput = Omit<SavedPhrase, "id" | "createdAt">;

export const SAVED_PHRASE_REWRITE_LABELS: Record<SavedPhraseRewriteType, string> = {
  natural: "Natural",
  conversational: "Conversational",
  literary: "Literary",
  alternative: "Alternative",
};

const STORAGE_KEY = "rossiyani:savedPhrases";
const MAX_ENTRIES = 500;

function isBrowser(): boolean {
  return typeof localStorage !== "undefined";
}

function normalizeSentence(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function loadPhrases(): SavedPhrase[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as SavedPhrase[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistPhrases(phrases: SavedPhrase[]): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(phrases.slice(0, MAX_ENTRIES)));
}

export function getSavedPhrases(): SavedPhrase[] {
  return loadPhrases().sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export function isPhraseSaved(originalSentence: string, rewrittenSentence: string): boolean {
  const original = normalizeSentence(originalSentence);
  const rewritten = normalizeSentence(rewrittenSentence);

  return loadPhrases().some(
    (phrase) =>
      normalizeSentence(phrase.originalSentence) === original &&
      normalizeSentence(phrase.rewrittenSentence) === rewritten,
  );
}

export function savePhrase(input: SavePhraseInput): SavedPhrase {
  const phrases = loadPhrases();
  const original = normalizeSentence(input.originalSentence);
  const rewritten = normalizeSentence(input.rewrittenSentence);

  const existing = phrases.find(
    (phrase) =>
      normalizeSentence(phrase.originalSentence) === original &&
      normalizeSentence(phrase.rewrittenSentence) === rewritten,
  );
  if (existing) {
    return existing;
  }

  const entry: SavedPhrase = {
    ...input,
    originalSentence: original,
    rewrittenSentence: rewritten,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const next = [entry, ...phrases];
  if (next.length > MAX_ENTRIES) {
    next.sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
  }

  persistPhrases(next);
  return entry;
}

export function removePhrase(id: string): void {
  persistPhrases(loadPhrases().filter((phrase) => phrase.id !== id));
}

/** Maps Practice rewrite preset ids to stored rewrite types. */
export function rewriteTypeFromPresetId(presetId: string): SavedPhraseRewriteType {
  switch (presetId) {
    case "natural":
      return "natural";
    case "conversational":
      return "conversational";
    case "literary":
      return "literary";
    default:
      return "alternative";
  }
}
