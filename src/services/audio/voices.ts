export type AudioVoiceConfig = {
  id: string;
  label: string;
  lang: string;
  azureVoice: string;
  elevenLabsVoiceId: string;
};

export const DEFAULT_VOICE_ID = "ru-svetlana";

export const AUDIO_VOICES: Record<string, AudioVoiceConfig> = {
  [DEFAULT_VOICE_ID]: {
    id: DEFAULT_VOICE_ID,
    label: "Svetlana (russe)",
    lang: "ru-RU",
    azureVoice: "ru-RU-SvetlanaNeural",
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_RU ?? "pNInz6obpgDQGcFmaJgB",
  },
};

export function getVoiceConfig(voiceId: string): AudioVoiceConfig {
  return AUDIO_VOICES[voiceId] ?? AUDIO_VOICES[DEFAULT_VOICE_ID]!;
}
