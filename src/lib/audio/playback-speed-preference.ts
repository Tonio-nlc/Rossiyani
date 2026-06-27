const STORAGE_KEY = "rossiyani:audioPlaybackSpeed";

export function getPlaybackSpeedPreference(): number {
  if (typeof localStorage === "undefined") {
    return 1;
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  const value = raw ? Number(raw) : 1;
  return [0.75, 1, 1.25, 1.5].includes(value) ? value : 1;
}

export function setPlaybackSpeedPreference(speed: number): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, String(speed));
}
