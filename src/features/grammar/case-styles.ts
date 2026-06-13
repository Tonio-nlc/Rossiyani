/** Visual tokens for Russian grammatical cases (endings dominant) — dark theme. */

export type CaseKey =
  | "nominative"
  | "genitive"
  | "dative"
  | "accusative"
  | "instrumental"
  | "prepositional"
  | "locative";

export type CaseStyle = {
  key: CaseKey;
  endingBg: string;
  endingText: string;
  endingBorder: string;
  chipBg: string;
  chipText: string;
  dotClass: string;
};

export const CASE_STYLES: Record<CaseKey, CaseStyle> = {
  nominative: {
    key: "nominative",
    endingBg: "bg-blue-500/15",
    endingText: "text-blue-300",
    endingBorder: "border-blue-500/50",
    chipBg: "bg-blue-500/10",
    chipText: "text-blue-300",
    dotClass: "bg-blue-500",
  },
  genitive: {
    key: "genitive",
    endingBg: "bg-violet-500/15",
    endingText: "text-violet-300",
    endingBorder: "border-violet-500/50",
    chipBg: "bg-violet-500/10",
    chipText: "text-violet-300",
    dotClass: "bg-violet-500",
  },
  dative: {
    key: "dative",
    endingBg: "bg-amber-500/15",
    endingText: "text-amber-300",
    endingBorder: "border-amber-500/50",
    chipBg: "bg-amber-500/10",
    chipText: "text-amber-300",
    dotClass: "bg-amber-500",
  },
  accusative: {
    key: "accusative",
    endingBg: "bg-red-500/15",
    endingText: "text-red-300",
    endingBorder: "border-red-500/50",
    chipBg: "bg-red-500/10",
    chipText: "text-red-300",
    dotClass: "bg-red-500",
  },
  instrumental: {
    key: "instrumental",
    endingBg: "bg-green-500/15",
    endingText: "text-green-300",
    endingBorder: "border-green-500/50",
    chipBg: "bg-green-500/10",
    chipText: "text-green-300",
    dotClass: "bg-green-500",
  },
  prepositional: {
    key: "prepositional",
    endingBg: "bg-cyan-500/15",
    endingText: "text-cyan-300",
    endingBorder: "border-cyan-500/50",
    chipBg: "bg-cyan-500/10",
    chipText: "text-cyan-300",
    dotClass: "bg-cyan-500",
  },
  locative: {
    key: "locative",
    endingBg: "bg-cyan-500/15",
    endingText: "text-cyan-300",
    endingBorder: "border-cyan-500/50",
    chipBg: "bg-cyan-500/10",
    chipText: "text-cyan-300",
    dotClass: "bg-cyan-500",
  },
};

const CASE_ALIASES: Record<string, CaseKey> = {
  nominative: "nominative",
  nominatif: "nominative",
  genitive: "genitive",
  génitif: "genitive",
  genitif: "genitive",
  dative: "dative",
  datif: "dative",
  accusative: "accusative",
  accusatif: "accusative",
  instrumental: "instrumental",
  prepositional: "prepositional",
  prépositionnel: "prepositional",
  prepositionnel: "prepositional",
  locative: "locative",
  locatif: "locative",
};

export function normalizeCaseKey(raw?: string | null): CaseKey | null {
  if (!raw) {
    return null;
  }
  const key = CASE_ALIASES[raw.toLowerCase().trim()];
  return key ?? null;
}

export function getCaseStyle(raw?: string | null): CaseStyle | null {
  const key = normalizeCaseKey(raw);
  return key ? CASE_STYLES[key] : null;
}

export function formatCaseLabelFr(raw?: string | null): string | null {
  const key = normalizeCaseKey(raw);
  if (!key) {
    return null;
  }
  const labels: Record<CaseKey, string> = {
    nominative: "nominatif",
    genitive: "génitif",
    dative: "datif",
    accusative: "accusatif",
    instrumental: "instrumental",
    prepositional: "prépositionnel",
    locative: "locatif",
  };
  return labels[key];
}
