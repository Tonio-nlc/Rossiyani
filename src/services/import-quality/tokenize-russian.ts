const CYRILLIC_WORD = /[\p{Script=Cyrillic}]+(?:-[\p{Script=Cyrillic}]+)*/gu;

export function extractRussianTokens(text: string): string[] {
  CYRILLIC_WORD.lastIndex = 0;
  return [...text.matchAll(CYRILLIC_WORD)].map((match) => match[0]!);
}

export function normalizeTokenSurface(surface: string): string {
  return surface.normalize("NFC").toLocaleLowerCase("ru-RU");
}

/** Removes INVALID token surfaces from a sentence while preserving punctuation. */
export function sanitizeSentenceText(
  sentence: string,
  invalidSurfaces: string[] | Set<string>,
): string {
  const invalidSet =
    invalidSurfaces instanceof Set ? invalidSurfaces : new Set(invalidSurfaces);
  if (invalidSet.size === 0) {
    return sentence;
  }

  return sentence.replace(CYRILLIC_WORD, (word) => {
    const key = normalizeTokenSurface(word);
    return invalidSet.has(key) ? "" : word;
  }).replace(/\s{2,}/g, " ").trim();
}
