export type TranslationDisplayMode = "hidden" | "manual" | "all";

const MODE_KEY = "rossiyani:translationDisplayMode";
const INTERLINEAR_KEY = "rossiyani:interlinearTranslation";
const LEGACY_KEY = "rossiyani:showSentenceTranslations";

const VALID_MODES: TranslationDisplayMode[] = ["hidden", "manual", "all"];

function isBrowser(): boolean {
  return typeof localStorage !== "undefined";
}

function migrateLegacyMode(): TranslationDisplayMode | null {
  if (!isBrowser()) {
    return null;
  }
  const raw = localStorage.getItem(LEGACY_KEY);
  if (raw === "1") {
    return "all";
  }
  if (raw === "0") {
    return "manual";
  }
  return null;
}

export function getTranslationDisplayMode(): TranslationDisplayMode {
  if (!isBrowser()) {
    return "manual";
  }

  const raw = localStorage.getItem(MODE_KEY);
  if (raw && VALID_MODES.includes(raw as TranslationDisplayMode)) {
    return raw as TranslationDisplayMode;
  }

  const migrated = migrateLegacyMode();
  if (migrated) {
    setTranslationDisplayMode(migrated);
    return migrated;
  }

  return "manual";
}

export function setTranslationDisplayMode(mode: TranslationDisplayMode): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(MODE_KEY, mode);
}

export function getInterlinearTranslationPreference(): boolean {
  if (!isBrowser()) {
    return false;
  }
  return localStorage.getItem(INTERLINEAR_KEY) === "1";
}

export function setInterlinearTranslationPreference(enabled: boolean): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(INTERLINEAR_KEY, enabled ? "1" : "0");
}

export function resolveTranslationVisible(
  sentenceId: string,
  mode: TranslationDisplayMode,
  expandedIds: ReadonlySet<string>,
): boolean {
  if (mode === "all") {
    return true;
  }
  if (mode === "hidden") {
    return false;
  }
  return expandedIds.has(sentenceId);
}

export function shouldShowTranslationToggle(mode: TranslationDisplayMode): boolean {
  return mode === "manual";
}
