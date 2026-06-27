"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getInterlinearTranslationPreference,
  getTranslationDisplayMode,
  setInterlinearTranslationPreference,
  setTranslationDisplayMode,
  type TranslationDisplayMode,
} from "@/lib/reader/translation-display-preference";

export function useTranslationDisplay(): {
  mode: TranslationDisplayMode;
  setMode: (mode: TranslationDisplayMode) => void;
  interlinear: boolean;
  setInterlinear: (enabled: boolean) => void;
} {
  const [mode, setModeState] = useState<TranslationDisplayMode>("manual");
  const [interlinear, setInterlinearState] = useState(false);

  useEffect(() => {
    setModeState(getTranslationDisplayMode());
    setInterlinearState(getInterlinearTranslationPreference());
  }, []);

  const setMode = useCallback((next: TranslationDisplayMode) => {
    setModeState(next);
    setTranslationDisplayMode(next);
  }, []);

  const setInterlinear = useCallback((enabled: boolean) => {
    setInterlinearState(enabled);
    setInterlinearTranslationPreference(enabled);
  }, []);

  return { mode, setMode, interlinear, setInterlinear };
}
