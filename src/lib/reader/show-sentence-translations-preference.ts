const STORAGE_KEY = "rossiyani:showSentenceTranslations";

export function getShowSentenceTranslationsPreference(): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return true;
  }
  return raw === "1";
}

export function setShowSentenceTranslationsPreference(show: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, show ? "1" : "0");
}
