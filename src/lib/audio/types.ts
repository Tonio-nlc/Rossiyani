export type { AudioResolveInput, AudioResolveResult, AudioClipResult, AudioFallbackResult } from "@/services/audio/types";
export { isAudioFallback } from "@/services/audio/types";

export type PlaybackState = "idle" | "loading" | "playing" | "paused";

export const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5] as const;

export type TextPlaybackSession = {
  sentenceIds: string[];
  currentIndex: number;
};
