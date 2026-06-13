import type { SentenceAnalysisOutput } from "@/services/ai/schemas";

import { classifyToken } from "./classify-token";
import { loadKnownLexiconSnapshot } from "./load-known-lexicon";
import { extractRussianTokens, normalizeTokenSurface } from "./tokenize-russian";
import type { ImportTextQualityReport, TokenQualityEntry } from "./types";

function aggregateEntries(entries: Map<string, TokenQualityEntry>): ImportTextQualityReport {
  const tokens = [...entries.values()].sort((a, b) => a.surface.localeCompare(b.surface, "ru"));
  let knownCount = 0;
  let unknownCount = 0;
  let suspiciousCount = 0;
  let invalidCount = 0;
  const invalidSurfaces: string[] = [];

  for (const token of tokens) {
    switch (token.status) {
      case "KNOWN":
        knownCount += 1;
        break;
      case "UNKNOWN":
        unknownCount += 1;
        break;
      case "SUSPICIOUS":
        suspiciousCount += 1;
        break;
      case "INVALID":
        invalidCount += 1;
        invalidSurfaces.push(token.normalized);
        break;
    }
  }

  return {
    tokens,
    knownCount,
    unknownCount,
    suspiciousCount,
    invalidCount,
    invalidSurfaces,
  };
}

function reportLookup(report: ImportTextQualityReport): Map<string, TokenQualityEntry> {
  return new Map(report.tokens.map((token) => [token.normalized, token]));
}

export async function validateImportTextLexical(text: string): Promise<ImportTextQualityReport> {
  const snapshot = await loadKnownLexiconSnapshot();
  const frequency = new Map<string, number>();

  for (const surface of extractRussianTokens(text)) {
    const key = normalizeTokenSurface(surface);
    frequency.set(key, (frequency.get(key) ?? 0) + 1);
  }

  const entries = new Map<string, TokenQualityEntry>();

  for (const [normalized, count] of frequency) {
    const originalSurface =
      extractRussianTokens(text).find((token) => normalizeTokenSurface(token) === normalized) ??
      normalized;

    entries.set(
      normalized,
      classifyToken(originalSurface, {
        knownFormKeys: snapshot.knownFormKeys,
        knownLemmaKeys: snapshot.knownLemmaKeys,
        knownFormSurfaces: snapshot.knownFormSurfaces,
        frequency: count,
      }),
    );
  }

  return aggregateEntries(entries);
}

export function mergeQualityReports(reports: ImportTextQualityReport[]): ImportTextQualityReport {
  const merged = new Map<string, TokenQualityEntry>();

  for (const report of reports) {
    for (const token of report.tokens) {
      const existing = merged.get(token.normalized);
      if (!existing) {
        merged.set(token.normalized, { ...token });
        continue;
      }
      merged.set(token.normalized, {
        ...existing,
        frequency: existing.frequency + token.frequency,
        status:
          rankStatus(existing.status) > rankStatus(token.status)
            ? existing.status
            : token.status,
        confidence: Math.min(existing.confidence, token.confidence),
        suggestion: existing.suggestion ?? token.suggestion,
        reasons: [...new Set([...existing.reasons, ...token.reasons])],
      });
    }
  }

  return aggregateEntries(merged);
}

function rankStatus(status: TokenQualityEntry["status"]): number {
  switch (status) {
    case "INVALID":
      return 4;
    case "SUSPICIOUS":
      return 3;
    case "UNKNOWN":
      return 2;
    case "KNOWN":
      return 1;
  }
}

export function applyQualityToAnalysis(
  analysis: SentenceAnalysisOutput,
  report: ImportTextQualityReport,
): SentenceAnalysisOutput {
  let suspiciousInSentence = 0;
  const byNormalized = reportLookup(report);
  const invalidSet = new Set(report.invalidSurfaces);

  const words = analysis.words
    .filter((word) => {
      const entry = byNormalized.get(normalizeTokenSurface(word.original));
      return entry?.status !== "INVALID" && !invalidSet.has(normalizeTokenSurface(word.original));
    })
    .map((word, index) => {
      const entry = byNormalized.get(normalizeTokenSurface(word.original));
      if (!entry || entry.status !== "SUSPICIOUS") {
        return { ...word, position: index };
      }

      suspiciousInSentence += 1;
      const prefix = "[rossiyani:suspicious]";
      const explanation = word.explanation.startsWith(prefix)
        ? word.explanation
        : `${prefix} ${word.explanation}`;

      return {
        ...word,
        position: index,
        explanation,
      };
    });

  return {
    ...analysis,
    words,
    needsReview: analysis.needsReview || suspiciousInSentence > 0,
    reviewMessage:
      suspiciousInSentence > 0
        ? `Import qualité : ${suspiciousInSentence} mot(s) suspect(s) dans cette phrase.`
        : analysis.reviewMessage,
  };
}
