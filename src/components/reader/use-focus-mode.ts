"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "rossiyani:readerFocusMode";

export function useFocusMode(): {
  focusMode: boolean;
  setFocusMode: (enabled: boolean) => void;
} {
  const [focusMode, setFocusModeState] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setFocusModeState(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const setFocusMode = useCallback((enabled: boolean) => {
    setFocusModeState(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    }
  }, []);

  return { focusMode, setFocusMode };
}
