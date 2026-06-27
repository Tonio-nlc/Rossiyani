import { getVoiceConfig } from "../voices";
import type { TtsProvider, TtsSynthesisInput, TtsSynthesisResult } from "./types";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSsml(text: string, voiceName: string): string {
  return `<speak version="1.0" xml:lang="ru-RU"><voice name="${voiceName}">${escapeXml(text)}</voice></speak>`;
}

export const azureTtsProvider: TtsProvider = {
  id: "azure",

  isConfigured(): boolean {
    return Boolean(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION);
  },

  async synthesize(input: TtsSynthesisInput): Promise<TtsSynthesisResult> {
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;
    if (!key || !region) {
      throw new Error("Azure Speech n'est pas configuré.");
    }

    const voice = getVoiceConfig(input.voiceId);
    const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      },
      body: buildSsml(input.text, voice.azureVoice),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Azure TTS a échoué (${response.status})${detail ? `: ${detail}` : ""}`);
    }

    const audio = Buffer.from(await response.arrayBuffer());
    return { audio, mimeType: "audio/mpeg" };
  },
};
