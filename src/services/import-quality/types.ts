export type TokenQualityStatus = "KNOWN" | "UNKNOWN" | "SUSPICIOUS" | "INVALID";

export type TokenQualityEntry = {
  surface: string;
  normalized: string;
  status: TokenQualityStatus;
  confidence: number;
  reasons: string[];
  suggestion: string | null;
  /** Occurrences in the imported text. */
  frequency: number;
};

export type ImportTextQualityReport = {
  tokens: TokenQualityEntry[];
  knownCount: number;
  unknownCount: number;
  suspiciousCount: number;
  invalidCount: number;
  /** Normalized surfaces classified INVALID — stripped before AI analysis. */
  invalidSurfaces: string[];
};

export const SUSPICIOUS_WORD_MARK = "[rossiyani:suspicious]";
