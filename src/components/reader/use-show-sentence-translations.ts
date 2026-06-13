"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getShowSentenceTranslationsPreference,
  setShowSentenceTranslationsPreference,
} from "@/lib/reader/show-sentence-translations-preference";

export function useShowSentenceTranslations(): {
  showTranslations: boolean;
  setShowTranslations: (show: boolean) => void;
} {
  const [showTranslations, setShowTranslationsState] = useState(true);

  useEffect(() => {
    setShowTranslationsState(getShowSentenceTranslationsPreference());
  }, []);

  const setShowTranslations = useCallback((show: boolean) => {
    setShowTranslationsState(show);
    setShowSentenceTranslationsPreference(show);
  }, []);

  return { showTranslations, setShowTranslations };
}
