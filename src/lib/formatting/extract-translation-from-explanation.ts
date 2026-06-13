/**
 * Extracts a concise French gloss from pedagogical explanation text.
 * Returns null when no clear lexical translation is found.
 */
export function extractTranslationFromExplanation(explanation: string): string | null {
  const trimmed = explanation?.trim();
  if (!trimmed) {
    return null;
  }

  const lines = trimmed
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const extracted = extractFromLine(line);
    if (extracted) {
      return extracted;
    }
  }

  return extractFromLine(trimmed);
}

function extractFromLine(line: string): string | null {
  const clean = (value: string) =>
    value
      .replace(/^["«'']|["»'']$/g, "")
      .replace(/[»"']\.?$/, "")
      .replace(/\.$/, "")
      .trim();

  const arrow = line.match(/(?:→|->|Sens\s*:)\s*(.+)$/i);
  if (arrow?.[1]) {
    const value = clean(arrow[1]);
    if (value) {
      return value;
    }
  }

  const guillemets = line.match(/«([^»]+)»/);
  if (guillemets?.[1]) {
    const value = clean(guillemets[1]);
    if (value && !/[\p{Script=Cyrillic}]/u.test(value)) {
      return value;
    }
  }

  const quoted = line.match(/signifiant\s+["«']([^"»']+)["»']/i);
  if (quoted?.[1]) {
    const value = clean(quoted[1]);
    if (value) {
      return value;
    }
  }

  const posSignifiant = line.match(
    /(?:nom|verbe|adjectif|adverbe|pronom|particule|conjonction|préposition|preposition)\s+signifiant\s+(.+?)(?:\.|,|$)/i,
  );
  if (posSignifiant?.[1]) {
    const value = clean(posSignifiant[1]);
    if (value && !/^["«]/.test(value)) {
      return value;
    }
  }

  const appele = line.match(/appelé[e]?\s+(\p{L}[\p{L}-]{1,40})/iu);
  if (appele?.[1]) {
    const value = clean(appele[1]);
    if (value) {
      return value;
    }
  }

  const designant = line.match(
    /désignant\s+(?:un(?:e)?\s+)?(?:[\p{L}\s-]{0,50}\s+)?(\p{L}[\p{L}-]{1,40})/iu,
  );
  if (designant?.[1]) {
    const value = clean(designant[1]);
    if (value && !/^(un|une|le|la|les|arbre|nom|fruitier)/i.test(value)) {
      return value;
    }
  }

  const refereAux = line.match(/se réfère aux?\s+(.+?)(?:\.|$)/i);
  if (refereAux?.[1]) {
    const value = normalizeReferralPhrase(clean(refereAux[1]));
    if (value) {
      return value;
    }
  }

  const refereAQuelqueChose = line.match(/se réfère à quelque chose de\s+(.+?)(?:\.|$)/i);
  if (refereAQuelqueChose?.[1]) {
    const value = normalizeCommunOuNormal(clean(refereAQuelqueChose[1]));
    if (value) {
      return value;
    }
  }

  return null;
}

const REFERRAL_NORMALIZATIONS: Array<{ pattern: RegExp; value: string }> = [
  { pattern: /jours?\s+(?:de\s+la\s+)?semaine\s+(?:de\s+)?travail/i, value: "jours ouvrables" },
  { pattern: /jours?\s+ouvrables?/i, value: "jours ouvrables" },
];

function normalizeReferralPhrase(phrase: string): string | null {
  if (!phrase) {
    return null;
  }
  for (const { pattern, value } of REFERRAL_NORMALIZATIONS) {
    if (pattern.test(phrase)) {
      return value;
    }
  }
  return phrase;
}

function normalizeCommunOuNormal(phrase: string): string | null {
  if (!phrase) {
    return null;
  }
  if (/commun\s+(ou\s+)?normal/i.test(phrase)) {
    return "habituel / ordinaire";
  }
  if (/habituel/i.test(phrase)) {
    return "habituel";
  }
  if (/ordinaire/i.test(phrase)) {
    return "ordinaire";
  }
  return phrase;
}
