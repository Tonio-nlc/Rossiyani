"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { LEARNING_SIGNALS_COOKIE } from "@/features/discovery/cookies";
import {
  buildLearningSignals,
  serializeLearningSignals,
} from "@/lib/discovery/build-learning-signals";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function writeLearningSignalsCookie(): void {
  const signals = buildLearningSignals();
  const value = serializeLearningSignals(signals);
  document.cookie = `${LEARNING_SIGNALS_COOKIE}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function SyncLearningSignals() {
  const pathname = usePathname();

  useEffect(() => {
    writeLearningSignalsCookie();

    const onStorage = (event: StorageEvent) => {
      if (!event.key?.startsWith("rossiyani:")) {
        return;
      }
      writeLearningSignalsCookie();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", writeLearningSignalsCookie);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", writeLearningSignalsCookie);
    };
  }, [pathname]);

  return null;
}
