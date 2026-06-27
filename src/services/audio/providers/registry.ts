import { azureTtsProvider } from "./azure-tts-provider";
import { elevenLabsTtsProvider } from "./elevenlabs-tts-provider";
import type { TtsProvider } from "./types";

const PROVIDERS: TtsProvider[] = [azureTtsProvider, elevenLabsTtsProvider];

export function getConfiguredTtsProvider(): TtsProvider | null {
  const preferred = process.env.AUDIO_TTS_PROVIDER?.toLowerCase();

  if (preferred === "azure" && azureTtsProvider.isConfigured()) {
    return azureTtsProvider;
  }
  if (preferred === "elevenlabs" && elevenLabsTtsProvider.isConfigured()) {
    return elevenLabsTtsProvider;
  }

  return PROVIDERS.find((provider) => provider.isConfigured()) ?? null;
}
