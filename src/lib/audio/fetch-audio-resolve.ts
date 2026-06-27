import type { AudioResolveInput, AudioResolveResult } from "./types";

const memoryCache = new Map<string, AudioResolveResult>();

function cacheKey(input: AudioResolveInput): string {
  if (input.scope === "utterance") {
    return `utterance:${input.cacheKey ?? input.text}:${input.voiceId ?? "default"}`;
  }
  return `${input.scope}:${input.entityId}:${input.voiceId ?? "default"}`;
}

export async function fetchAudioResolve(input: AudioResolveInput): Promise<AudioResolveResult> {
  const key = cacheKey(input);
  const cached = memoryCache.get(key);
  if (cached) {
    return cached;
  }

  const response = await fetch("/api/audio/resolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Impossible de charger l'audio.");
  }

  const result = (await response.json()) as AudioResolveResult;
  memoryCache.set(key, result);
  return result;
}

export function prefetchAudioResolve(input: AudioResolveInput): void {
  void fetchAudioResolve(input).catch(() => undefined);
}
