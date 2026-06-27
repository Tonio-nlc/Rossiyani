import { isPunctuationToken } from "@/lib/formatting/is-punctuation-token";
import { extractWordTranslationFromRaw } from "@/lib/import/word-translation";
import { logImportPhase } from "@/lib/diagnostics";
import type { z } from "zod";

import {
  attachAnalysisStatus,
  resolveAnalysisStatus,
} from "./analysis-status";
import { buildMinimalAnalysis } from "./build-minimal-analysis";
import {
  normalizePartOfSpeech,
  safeParsePhraseGroupAnalysisOutput,
  safeParseWordAnalysisOutput,
  sentenceAnalysisOutputSchema,
  sentenceAnalysisShellSchema,
  warnStemEndingMismatch,
  type PhraseGroupAnalysisOutput,
  type SentenceAnalysisOutput,
  type WordAnalysisOutput,
} from "./schemas/sentence-analysis.schema";

export type TolerantParseResult = {
  analysis: SentenceAnalysisOutput;
  warnings: string[];
  partialWordCount: number;
  skippedWordCount: number;
  isFallback: boolean;
};

export type TolerantParseOptions = {
  /** Original Russian input when AI shell is incomplete. */
  fallbackRussianText?: string;
};

/**
 * Parses AI analysis JSON word-by-word.
 * Invalid tokens are salvaged as partial; empty words[] yields PARTIAL, never throws.
 */
export function parseSentenceAnalysisTolerant(
  data: unknown,
  options?: TolerantParseOptions,
): TolerantParseResult {
  const warnings: string[] = [];
  const fallbackRussianText = options?.fallbackRussianText?.trim();

  const shellResult = sentenceAnalysisShellSchema.safeParse(data);
  if (!shellResult.success) {
    const salvaged = salvageShellFromUnknown(data, fallbackRussianText);
    if (!salvaged) {
      if (!fallbackRussianText) {
        throw shellResult.error;
      }
      logImportPhase("parse tolerant: shell invalid — minimal fallback", {
        issues: shellResult.error.flatten(),
      });
      return {
        analysis: buildMinimalAnalysis({
          russianText: fallbackRussianText,
          status: "failed",
          reason: "Réponse IA invalide — structure JSON non reconnue.",
        }),
        warnings: ["shell: validation échouée, analyse minimale utilisée"],
        partialWordCount: 0,
        skippedWordCount: 0,
        isFallback: true,
      };
    }
    warnings.push("shell: champs partiellement récupérés depuis JSON non conforme");
    return buildFromShell(salvaged, warnings, fallbackRussianText, true);
  }

  return buildFromShell(shellResult.data, warnings, fallbackRussianText, false);
}

function buildFromShell(
  shell: z.infer<typeof sentenceAnalysisShellSchema>,
  warnings: string[],
  fallbackRussianText: string | undefined,
  salvagedShell: boolean,
): TolerantParseResult {
  const rawWords = Array.isArray(shell.words) ? shell.words : [];
  const words: WordAnalysisOutput[] = [];
  let partialWordCount = 0;
  let skippedWordCount = 0;

  rawWords.forEach((rawWord, index) => {
    const parsed = parseWordTolerant(rawWord, index, warnings);
    if (!parsed) {
      skippedWordCount += 1;
      return;
    }
    if (parsed.analysisStatus === "partial") {
      partialWordCount += 1;
    }
    words.push(parsed);
  });

  if (words.length === 0) {
    warnings.push("words: tableau vide — analyse enregistrée sans détail mot à mot");
    logImportPhase("parse tolerant: empty words array", {
      russianText: shell.russianText,
      hasTranslations: Boolean(shell.naturalTranslation),
    });
  } else {
    words.forEach((word, position) => {
      word.position = position;
    });
  }

  const phraseGroups: PhraseGroupAnalysisOutput[] = [];
  const rawGroups = Array.isArray(shell.phraseGroups) ? shell.phraseGroups : [];
  for (const [index, rawGroup] of rawGroups.entries()) {
    const groupResult = safeParsePhraseGroupAnalysisOutput(rawGroup);
    if (groupResult.success) {
      phraseGroups.push(groupResult.data);
      continue;
    }
    warnings.push(`phraseGroup[${index}]: ignoré (${formatZodIssues(groupResult.error)})`);
    logImportPhase("parse warning: phraseGroup skipped", {
      index,
      issues: groupResult.error.flatten(),
    });
  }

  const wordCount = words.length;
  const validPhraseGroups = phraseGroups.filter((group) => {
    if (wordCount === 0) {
      warnings.push(`phraseGroup "${group.label}": ignoré (aucun mot analysé)`);
      return false;
    }
    if (group.endPosition >= wordCount || group.startPosition >= wordCount) {
      warnings.push(
        `phraseGroup "${group.label}": positions hors limites après renumérotation, ignoré`,
      );
      return false;
    }
    return true;
  });

  const emptyWords = words.length === 0;
  const needsReview =
    shell.needsReview ||
    partialWordCount > 0 ||
    skippedWordCount > 0 ||
    emptyWords ||
    salvagedShell;

  const reviewParts: string[] = [];
  if (emptyWords) {
    reviewParts.push("analyse mot à mot indisponible");
  }
  if (partialWordCount > 0) {
    reviewParts.push(`${partialWordCount} mot(s) en analyse partielle`);
  }
  if (skippedWordCount > 0) {
    reviewParts.push(`${skippedWordCount} token(s) ignoré(s)`);
  }

  const status = resolveAnalysisStatus({
    wordsLength: words.length,
    partialWordCount,
    skippedWordCount,
    hasSalvagedShell: salvagedShell || Boolean(shell.naturalTranslation),
    isFallback: false,
  });

  const merged: SentenceAnalysisOutput = {
    russianText: shell.russianText || fallbackRussianText || "",
    literalTranslation: shell.literalTranslation,
    naturalTranslation: shell.naturalTranslation,
    russianLogic: shell.russianLogic,
    orderExplanation: shell.orderExplanation,
    nativeUsageNotes: shell.nativeUsageNotes,
    register: shell.register,
    difficultyScore: shell.difficultyScore,
    words,
    phraseGroups: validPhraseGroups,
    syntaxAnalysis: emptyWords ? undefined : shell.syntaxAnalysis,
    culturalNotes: shell.culturalNotes ?? [],
    needsReview,
    reviewMessage:
      reviewParts.length > 0
        ? [shell.reviewMessage, reviewParts.join(" · ")].filter(Boolean).join(" · ")
        : shell.reviewMessage ?? null,
    analysisStatus: status,
  };

  const finalResult = sentenceAnalysisOutputSchema.safeParse(merged);
  if (!finalResult.success) {
    if (!fallbackRussianText && !shell.russianText) {
      throw finalResult.error;
    }
    logImportPhase("parse tolerant: final validation failed — minimal fallback", {
      issues: finalResult.error.flatten(),
    });
    return {
      analysis: buildMinimalAnalysis({
        russianText: shell.russianText || fallbackRussianText!,
        status: "failed",
        reason: "Validation finale échouée.",
        partial: {
          literalTranslation: shell.literalTranslation,
          naturalTranslation: shell.naturalTranslation,
          russianLogic: shell.russianLogic,
          orderExplanation: shell.orderExplanation,
          nativeUsageNotes: shell.nativeUsageNotes,
          register: shell.register,
          difficultyScore: shell.difficultyScore,
        },
      }),
      warnings: [...warnings, "final validation: échec, analyse minimale"],
      partialWordCount,
      skippedWordCount,
      isFallback: true,
    };
  }

  if (warnings.length > 0) {
    logImportPhase("parse tolerant warnings", {
      warningCount: warnings.length,
      partialWordCount,
      skippedWordCount,
      wordCount: words.length,
      analysisStatus: status,
      warnings: warnings.slice(0, 20),
    });
  }

  return {
    analysis: attachAnalysisStatus(finalResult.data, status),
    warnings,
    partialWordCount,
    skippedWordCount,
    isFallback: false,
  };
}

function salvageShellFromUnknown(
  data: unknown,
  fallbackRussianText?: string,
): z.infer<typeof sentenceAnalysisShellSchema> | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const raw = data as Record<string, unknown>;
  const russianText = stringField(raw.russianText) ?? fallbackRussianText;
  const naturalTranslation = stringField(raw.naturalTranslation);
  const literalTranslation = stringField(raw.literalTranslation);

  if (!russianText || (!naturalTranslation && !literalTranslation)) {
    return null;
  }

  return {
    russianText,
    literalTranslation: literalTranslation ?? naturalTranslation ?? "—",
    naturalTranslation: naturalTranslation ?? literalTranslation ?? "—",
    russianLogic: stringField(raw.russianLogic) ?? "Analyse partielle.",
    orderExplanation: stringField(raw.orderExplanation) ?? "—",
    nativeUsageNotes: stringField(raw.nativeUsageNotes) ?? "—",
    register: (stringField(raw.register) as SentenceAnalysisOutput["register"]) ?? "neutral",
    difficultyScore: (typeof raw.difficultyScore === "number"
      ? raw.difficultyScore
      : 3) as SentenceAnalysisOutput["difficultyScore"],
    words: Array.isArray(raw.words) ? raw.words : [],
    phraseGroups: Array.isArray(raw.phraseGroups) ? raw.phraseGroups : [],
    syntaxAnalysis: undefined,
    culturalNotes: [],
    needsReview: true,
    reviewMessage: stringField(raw.reviewMessage) ?? "Réponse IA partielle.",
  };
}

function stringField(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseWordTolerant(
  rawWord: unknown,
  index: number,
  warnings: string[],
): WordAnalysisOutput | null {
  if (!rawWord || typeof rawWord !== "object") {
    warnings.push(`word[${index}]: entrée invalide, ignorée`);
    return null;
  }

  const raw = rawWord as Record<string, unknown>;
  const original = String(raw.original ?? "").trim();
  if (!original) {
    warnings.push(`word[${index}]: original vide, ignoré`);
    return null;
  }

  if (isPunctuationToken(original)) {
    warnings.push(`word[${index}] "${original}": ponctuation ignorée`);
    return null;
  }

  const candidate = normalizeWordCandidate(raw, index);
  const parsed = safeParseWordAnalysisOutput(candidate);

  if (parsed.success) {
    warnStemEndingMismatch(parsed.data);
    return parsed.data;
  }

  warnings.push(`word[${index}] "${original}": ${formatZodIssues(parsed.error)}`);
  const salvaged = salvagePartialWord(raw, index, parsed.error);
  warnStemEndingMismatch(salvaged);
  return salvaged;
}

function normalizeWordCandidate(raw: Record<string, unknown>, index: number): Record<string, unknown> {
  const original = String(raw.original ?? "").trim();
  const ending = String(raw.ending ?? "");
  const stem = String(raw.stem ?? original);
  const { translationCanonical, translationAlternatives } = extractWordTranslationFromRaw(raw);

  return {
    ...raw,
    position: typeof raw.position === "number" ? raw.position : index,
    original,
    lemma: String(raw.lemma ?? original).trim() || original,
    stressMarked: String(raw.stressMarked ?? original).trim() || original,
    stem,
    ending,
    partOfSpeech: normalizePartOfSpeech(raw.partOfSpeech) ?? "noun",
    explanation: String(raw.explanation ?? "Analyse partielle.").trim() || "Analyse partielle.",
    ...(translationCanonical ? { translationCanonical } : {}),
    ...(translationAlternatives.length > 0 ? { translationAlternatives } : {}),
    analysisStatus: raw.analysisStatus ?? "complete",
  };
}

function salvagePartialWord(
  raw: Record<string, unknown>,
  index: number,
  error: { flatten: () => { fieldErrors: Record<string, string[]> } },
): WordAnalysisOutput {
  const original = String(raw.original ?? "").trim();
  const ending = String(raw.ending ?? "");
  const stem = String(raw.stem ?? original);
  const { translationCanonical, translationAlternatives } = extractWordTranslationFromRaw(raw);

  const salvaged = {
    position: typeof raw.position === "number" ? raw.position : index,
    original,
    lemma: String(raw.lemma ?? original).trim() || original,
    stressMarked: String(raw.stressMarked ?? original).trim() || original,
    stem,
    ending,
    partOfSpeech: normalizePartOfSpeech(raw.partOfSpeech) ?? "noun",
    case: nullableString(raw.case),
    gender: nullableString(raw.gender),
    number: nullableString(raw.number),
    tense: nullableString(raw.tense),
    aspect: nullableString(raw.aspect),
    explanation: String(raw.explanation ?? "Analyse partielle — validation incomplète.").trim(),
    ...(translationCanonical ? { translationCanonical } : {}),
    ...(translationAlternatives.length > 0 ? { translationAlternatives } : {}),
    frequency: raw.frequency ?? null,
    frequencyTier: raw.frequencyTier ?? null,
    analysisStatus: "partial" as const,
  };

  const reparsed = safeParseWordAnalysisOutput(salvaged);
  if (reparsed.success) {
    logImportPhase("parse tolerant: word salvaged as partial", {
      index,
      original,
      fieldErrors: error.flatten().fieldErrors,
    });
    return { ...reparsed.data, analysisStatus: "partial" };
  }

  return {
    position: index,
    original,
    lemma: original,
    stressMarked: original,
    stem: original,
    ending: "",
    partOfSpeech: "noun",
    isProperNoun: false,
    lexicalType: "common_noun",
    explanation: "Analyse partielle — champs minimaux uniquement.",
    analysisStatus: "partial",
  };
}

function nullableString(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }
  return value.trim();
}

function formatZodIssues(error: { flatten: () => { fieldErrors: Record<string, string[]> } }): string {
  const flat = error.flatten().fieldErrors;
  const parts = Object.entries(flat).map(([field, messages]) => `${field}: ${messages?.join(", ")}`);
  return parts.join("; ") || "validation échouée";
}
