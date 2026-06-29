import {
  A1_FIRST_SESSION_TEXT_IDS,
  isFirstSessionTextId,
} from "@/lib/reader/foundation-pack-path";

const FIRST_SESSION_STORAGE_KEY = "rossiyani:firstSession";

export type FirstSessionState = {
  ahaDelivered: boolean;
  textsCompleted: string[];
};

function emptyFirstSession(): FirstSessionState {
  return { ahaDelivered: false, textsCompleted: [] };
}

function readFirstSession(): FirstSessionState {
  if (typeof localStorage === "undefined") {
    return emptyFirstSession();
  }
  try {
    const raw = localStorage.getItem(FIRST_SESSION_STORAGE_KEY);
    if (!raw) {
      return emptyFirstSession();
    }
    const parsed = JSON.parse(raw) as Partial<FirstSessionState>;
    return {
      ahaDelivered: parsed.ahaDelivered === true,
      textsCompleted: Array.isArray(parsed.textsCompleted) ? parsed.textsCompleted : [],
    };
  } catch {
    return emptyFirstSession();
  }
}

function writeFirstSession(state: FirstSessionState): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(FIRST_SESSION_STORAGE_KEY, JSON.stringify(state));
}

export function getFirstSessionState(): FirstSessionState {
  return readFirstSession();
}

export function isFirstSessionActive(): boolean {
  const state = readFirstSession();
  if (state.ahaDelivered) {
    return false;
  }
  const completedInPack = state.textsCompleted.filter((id) =>
    A1_FIRST_SESSION_TEXT_IDS.includes(id),
  );
  return completedInPack.length < A1_FIRST_SESSION_TEXT_IDS.length;
}

export function markFirstSessionTextCompleted(textId: string): void {
  if (!isFirstSessionTextId(textId)) {
    return;
  }
  const state = readFirstSession();
  if (!state.textsCompleted.includes(textId)) {
    state.textsCompleted.push(textId);
    writeFirstSession(state);
  }
}

export function markFirstSessionAhaDelivered(): void {
  const state = readFirstSession();
  state.ahaDelivered = true;
  writeFirstSession(state);
}

/** Family text — main Aha target (сестры / role marking). */
export const FIRST_SESSION_AHA_TEXT_ID = "text-a1-family-01";
export const FIRST_SESSION_AHA_PATTERN_ID = "lp.morphology.role_terminations.v1";
