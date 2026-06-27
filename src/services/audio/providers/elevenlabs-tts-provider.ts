import { getVoiceConfig } from "../voices";
import type { TtsProvider, TtsSynthesisInput, TtsSynthesisResult } from "./types";

export const elevenLabsTtsProvider: TtsProvider = {
  id: "elevenlabs",

  isConfigured(): boolean {
    return Boolean(process.env.ELEVENLABS_API_KEY);
  },

  async synthesize(input: TtsSynthesisInput): Promise<TtsSynthesisResult> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error("ElevenLabs n'est pas configuré.");
    }

    const voice = getVoiceConfig(input.voiceId);
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice.elevenLabsVoiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: input.text,
          model_id: process.env.ELEVENLABS_MODEL ?? "eleven_multilingual_v2",
        }),
      },
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`ElevenLabs TTS a échoué (${response.status})${detail ? `: ${detail}` : ""}`);
    }

    const audio = Buffer.from(await response.arrayBuffer());
    return { audio, mimeType: "audio/mpeg" };
  },
};
