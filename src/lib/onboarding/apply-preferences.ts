import { setPlaybackSpeedPreference } from "@/lib/audio/playback-speed-preference";
import {
  setInterlinearTranslationPreference,
  setTranslationDisplayMode,
} from "@/lib/reader/translation-display-preference";

import { applyThemePreference } from "../preferences/theme-preference";
import type { LearnerProfile } from "./types";

export function applyOnboardingPreferences(profile: Pick<
  LearnerProfile,
  "theme" | "translationDefault" | "audioSpeed"
>): void {
  applyThemePreference(profile.theme);
  setTranslationDisplayMode(profile.translationDefault);
  setInterlinearTranslationPreference(false);
  setPlaybackSpeedPreference(profile.audioSpeed);
}
