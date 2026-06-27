import { findCachedAudioClip, saveAudioClip } from "./audio-clip-repository";
import { getAudioSource } from "./get-audio-source";
import { getConfiguredTtsProvider } from "./providers/registry";
import { findStaticAudioFile, writeAudioCacheFile } from "./store-audio-buffer";
import type { AudioResolveInput, AudioResolveResult } from "./types";
import { getVoiceConfig } from "./voices";

export async function resolveAudioClip(input: AudioResolveInput): Promise<AudioResolveResult> {
  const source = await getAudioSource(input);
  if (!source) {
    throw new Error("Source audio introuvable.");
  }

  const cached = await findCachedAudioClip({
    scope: input.scope,
    entityId: source.entityId,
    voiceId: source.voiceId,
    contentHash: source.contentHash,
  });

  if (cached) {
    return {
      url: cached.publicUrl,
      mimeType: cached.mimeType,
      durationMs: cached.durationMs ?? undefined,
      provider: cached.provider.toLowerCase() as "static" | "azure" | "elevenlabs",
      cached: true,
    };
  }

  const staticUrl = await findStaticAudioFile(input.scope, source.entityId);
  if (staticUrl) {
    await saveAudioClip({
      scope: input.scope,
      entityId: source.entityId,
      voiceId: source.voiceId,
      provider: "static",
      contentHash: source.contentHash,
      publicUrl: staticUrl,
      mimeType: "audio/mpeg",
    });
    return {
      url: staticUrl,
      mimeType: "audio/mpeg",
      provider: "static",
      cached: false,
    };
  }

  const ttsProvider = getConfiguredTtsProvider();
  if (!ttsProvider) {
    const voice = getVoiceConfig(source.voiceId);
    return {
      fallback: true,
      text: source.text,
      lang: voice.lang,
    };
  }

  const synthesized = await ttsProvider.synthesize({
    text: source.text,
    voiceId: source.voiceId,
  });

  const publicUrl = await writeAudioCacheFile(source.contentHash, synthesized.audio);

  await saveAudioClip({
    scope: input.scope,
    entityId: source.entityId,
    voiceId: source.voiceId,
    provider: ttsProvider.id,
    contentHash: source.contentHash,
    publicUrl,
    mimeType: synthesized.mimeType,
  });

  return {
    url: publicUrl,
    mimeType: synthesized.mimeType,
    provider: ttsProvider.id,
    cached: false,
  };
}
