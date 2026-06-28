import type { PedagogicalAction } from "@/types/learning-orchestrator";

export {
  isInsightReady,
  isSecondContact,
  isFirstExploration,
  shouldShowPatternEcho,
  isTokenInPatternInstance,
  familiarityScore,
} from "@/services/learning-orchestrator/encounter-signals";

// Encounter persistence (local) — separate from orchestrator session budget.
import type { PatternEncounterState } from "@/types/reader-pattern-experience";

const STORAGE_KEY = "rossiyani:patternEncounters";

type EncounterStore = Record<string, PatternEncounterState>;

function emptyEncounter(): PatternEncounterState {
  return {
    exposureCount: 0,
    exploreCount: 0,
    lastTextId: null,
    lastTextTitle: null,
    lastSentenceId: null,
  };
}

function readStore(): EncounterStore {
  if (typeof localStorage === "undefined") {
    return {};
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as EncounterStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: EncounterStore): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getPatternEncounter(patternId: string): PatternEncounterState {
  return readStore()[patternId] ?? emptyEncounter();
}

export function recordPatternExposure(input: {
  patternId: string;
  textId: string;
  textTitle: string;
  sentenceId: string;
}): PatternEncounterState {
  const store = readStore();
  const current = store[input.patternId] ?? emptyEncounter();

  const alreadyCountedThisSentence =
    current.lastSentenceId === input.sentenceId && current.lastTextId === input.textId;

  const next: PatternEncounterState = {
    ...current,
    exposureCount: alreadyCountedThisSentence ? current.exposureCount : current.exposureCount + 1,
    lastTextId: input.textId,
    lastTextTitle: input.textTitle,
    lastSentenceId: input.sentenceId,
  };

  store[input.patternId] = next;
  writeStore(store);
  return next;
}

export function recordPatternExplore(patternId: string): PatternEncounterState {
  const store = readStore();
  const current = store[patternId] ?? emptyEncounter();
  const next: PatternEncounterState = {
    ...current,
    exploreCount: current.exploreCount + 1,
  };
  store[patternId] = next;
  writeStore(store);
  return next;
}

export function resetPatternEncounters(): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
}
