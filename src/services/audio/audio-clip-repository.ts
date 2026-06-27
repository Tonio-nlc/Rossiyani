import type { AudioClip, AudioProvider, AudioScope } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type { AudioProviderId } from "./types";

const PROVIDER_TO_DB: Record<AudioProviderId, AudioProvider> = {
  static: "STATIC",
  azure: "AZURE",
  elevenlabs: "ELEVENLABS",
};

const SCOPE_TO_DB = {
  sentence: "SENTENCE",
  word: "WORD",
  utterance: "UTTERANCE",
} as const satisfies Record<string, AudioScope>;

export function toDbProvider(provider: AudioProviderId): AudioProvider {
  return PROVIDER_TO_DB[provider];
}

export function toDbScope(scope: "sentence" | "word" | "utterance"): AudioScope {
  return SCOPE_TO_DB[scope];
}

export async function findCachedAudioClip(input: {
  scope: "sentence" | "word" | "utterance";
  entityId: string;
  voiceId: string;
  contentHash: string;
}): Promise<AudioClip | null> {
  const clip = await prisma.audioClip.findFirst({
    where: {
      scope: toDbScope(input.scope),
      entityId: input.entityId,
      voiceId: input.voiceId,
      contentHash: input.contentHash,
    },
  });
  return clip;
}

export async function saveAudioClip(input: {
  scope: "sentence" | "word" | "utterance";
  entityId: string;
  voiceId: string;
  provider: AudioProviderId;
  contentHash: string;
  publicUrl: string;
  mimeType: string;
  durationMs?: number;
}): Promise<AudioClip> {
  return prisma.audioClip.upsert({
    where: {
      scope_entityId_voiceId_provider: {
        scope: toDbScope(input.scope),
        entityId: input.entityId,
        voiceId: input.voiceId,
        provider: toDbProvider(input.provider),
      },
    },
    create: {
      scope: toDbScope(input.scope),
      entityId: input.entityId,
      voiceId: input.voiceId,
      provider: toDbProvider(input.provider),
      contentHash: input.contentHash,
      publicUrl: input.publicUrl,
      mimeType: input.mimeType,
      durationMs: input.durationMs,
    },
    update: {
      contentHash: input.contentHash,
      publicUrl: input.publicUrl,
      mimeType: input.mimeType,
      durationMs: input.durationMs,
    },
  });
}
