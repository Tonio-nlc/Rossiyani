const LEGACY_KEY = "rossiyani:showSentenceTranslations";

function isBrowser(): boolean {
  return typeof localStorage !== "undefined";
}

/** @deprecated Use `getTranslationDisplayMode()` from `translation-display-preference.ts`. */
export function getShowSentenceTranslationsPreference(): boolean {
  if (!isBrowser()) {
    return false;
  }
  const raw = localStorage.getItem(LEGACY_KEY);
  return raw === "1";
}

/** @deprecated Use `setTranslationDisplayMode()` from `translation-display-preference.ts`. */
export function setShowSentenceTranslationsPreference(show: boolean): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(LEGACY_KEY, show ? "1" : "0");
}

export {
  getInterlinearTranslationPreference,
  getTranslationDisplayMode,
  resolveTranslationVisible,
  setInterlinearTranslationPreference,
  setTranslationDisplayMode,
  shouldShowTranslationToggle,
  type TranslationDisplayMode,
} from "./translation-display-preference";
