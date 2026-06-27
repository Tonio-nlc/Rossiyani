import type { ThemePreference } from "@/lib/onboarding/types";

const STORAGE_KEY = "rossiyani:themePreference";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function resolveSystemTheme(): "light" | "dark" {
  if (!isBrowser()) {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getThemePreference(): ThemePreference {
  if (!isBrowser()) {
    return "light";
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === "light" || raw === "dark" || raw === "system") {
    return raw;
  }
  return "light";
}

export function setThemePreference(theme: ThemePreference): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, theme);
  applyThemePreference(theme);
}

export function applyThemePreference(theme: ThemePreference = getThemePreference()): void {
  if (!isBrowser()) {
    return;
  }
  const resolved = theme === "system" ? resolveSystemTheme() : theme;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePreference = theme;
}

export function initThemePreference(): void {
  applyThemePreference(getThemePreference());
}
