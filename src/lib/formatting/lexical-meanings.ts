import { LEXICAL_TRANSLATION_EMPTY } from "@/lib/formatting/lexical-validation";
import type { PartOfSpeech } from "@/types/domain";

export function splitLexicalMeanings(
  raw: string,
  partOfSpeech?: PartOfSpeech,
): string[] {
  if (raw.trim() === LEXICAL_TRANSLATION_EMPTY) {
    return [LEXICAL_TRANSLATION_EMPTY];
  }

  const trimmed = raw.trim();
  if (partOfSpeech === "preposition" && /\s\/\s/.test(trimmed)) {
    return [trimmed];
  }

  return [
    ...new Set(
      raw
        .split(/\s*[\/|;]\s*|\s+ou\s+/i)
        .flatMap((part) => part.split(/\n+/))
        .map((part) =>
          part
            .replace(/^["«]|["»]$/g, "")
            .replace(/\.$/, "")
            .trim(),
        )
        .filter(Boolean),
    ),
  ];
}
