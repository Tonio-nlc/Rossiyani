const STORAGE_KEY = "rossiyani:lastTextId";

export function getLastReadTextId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(STORAGE_KEY);
}

export function clearLastReadTextIfMatches(textId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  if (localStorage.getItem(STORAGE_KEY) === textId) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function setLastReadTextId(textId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, textId);
}
