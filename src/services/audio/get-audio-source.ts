import { prisma } from "@/lib/prisma";

import type { AudioResolveInput } from "./types";
import { hashAudioContent } from "./content-hash";
import { DEFAULT_VOICE_ID } from "./voices";

export type AudioSource = {
  entityId: string;
  text: string;
  contentHash: string;
  voiceId: string;
};

export async function getAudioSource(input: AudioResolveInput): Promise<AudioSource | null> {
  const voiceId = input.voiceId ?? DEFAULT_VOICE_ID;

  if (input.scope === "utterance") {
    const text = input.text.trim();
    if (!text) {
      return null;
    }
    const entityId = input.cacheKey?.trim() || hashAudioContent(text, voiceId);
    return {
      entityId,
      text,
      contentHash: hashAudioContent(text, voiceId),
      voiceId,
    };
  }

  if (input.scope === "sentence") {
    const sentence = await prisma.sentence.findUnique({
      where: { id: input.entityId },
      select: { id: true, russianText: true },
    });
    if (!sentence?.russianText.trim()) {
      return null;
    }
    return {
      entityId: sentence.id,
      text: sentence.russianText.trim(),
      contentHash: hashAudioContent(sentence.russianText, voiceId),
      voiceId,
    };
  }

  const word = await prisma.word.findUnique({
    where: { id: input.entityId },
    select: { id: true, stressMarked: true, original: true },
  });
  const text = word?.stressMarked?.trim() || word?.original?.trim() || "";
  if (!word || !text) {
    return null;
  }

  return {
    entityId: word.id,
    text,
    contentHash: hashAudioContent(text, voiceId),
    voiceId,
  };
}
