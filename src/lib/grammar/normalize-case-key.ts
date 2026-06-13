/** Shared case normalization for services (Reader uses features/grammar). */

export type CaseKey =
  | "nominative"
  | "genitive"
  | "dative"
  | "accusative"
  | "instrumental"
  | "prepositional"
  | "locative";

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

export function formatCaseTitleFr(caseKey: CaseKey): string {
  const labels: Record<CaseKey, string> = {
    nominative: "Nominatif",
    genitive: "Génitif",
    dative: "Datif",
    accusative: "Accusatif",
    instrumental: "Instrumental",
    prepositional: "Prépositionnel",
    locative: "Locatif",
  };
  return labels[caseKey];
}
