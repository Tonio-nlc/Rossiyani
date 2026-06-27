export type AudioScope = "sentence" | "word" | "utterance";

export type AudioProviderId = "static" | "azure" | "elevenlabs";

export type AudioResolveInput =
  | { scope: "sentence"; entityId: string; voiceId?: string }
  | { scope: "word"; entityId: string; voiceId?: string }
  | { scope: "utterance"; text: string; cacheKey?: string; voiceId?: string };

export type AudioClipResult = {
  url: string;
  mimeType: string;
  durationMs?: number;
  provider: AudioProviderId;
  cached: boolean;
};

export type AudioFallbackResult = {
  fallback: true;
  text: string;
  lang: string;
};

export type AudioResolveResult = AudioClipResult | AudioFallbackResult;

export function isAudioFallback(result: AudioResolveResult): result is AudioFallbackResult {
  return "fallback" in result && result.fallback === true;
}
