import { createHash } from "node:crypto";

export function hashAudioContent(text: string, voiceId: string): string {
  return createHash("sha256").update(`${voiceId}::${text.trim()}`).digest("hex").slice(0, 32);
}
