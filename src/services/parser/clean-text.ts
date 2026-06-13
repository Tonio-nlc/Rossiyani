/**
 * Normalizes pasted Russian text before sentence segmentation.
 */

const INVALID_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function cleanText(raw: string): string {
  let text = raw.normalize("NFC");
  text = text.replace(INVALID_CHARS, "");
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/ *\n */g, "\n");
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}
