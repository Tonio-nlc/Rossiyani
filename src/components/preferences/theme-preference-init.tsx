"use client";

import { useEffect } from "react";

import { initThemePreference } from "@/lib/preferences/theme-preference";

export function ThemePreferenceInit() {
  useEffect(() => {
    initThemePreference();
  }, []);

  return null;
}
