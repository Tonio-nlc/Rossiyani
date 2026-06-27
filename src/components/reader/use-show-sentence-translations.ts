"use client";

/**
 * @deprecated Use `use-translation-display.ts`.
 */
import { useTranslationDisplay } from "./use-translation-display";

export function useShowSentenceTranslations(): {
  showTranslations: boolean;
  setShowTranslations: (show: boolean) => void;
} {
  const { mode, setMode } = useTranslationDisplay();

  return {
    showTranslations: mode === "all",
    setShowTranslations: (show: boolean) => setMode(show ? "all" : "manual"),
  };
}
