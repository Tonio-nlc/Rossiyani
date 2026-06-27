import { wordFormMatchesOriginal } from "@/lib/formatting/word-form";
import {
  isProperNounPartOfSpeech,
  resolveWordLexicalMetadata,
} from "@/lib/linguistics/lexical-metadata";
import { logImportPhase } from "@/lib/diagnostics";
import { z } from "zod";
import type { LexicalType } from "@/types/domain";

const PROPER_NOUN_POS = new Set([
  "proper noun",
  "proper_noun",
  "proper-noun",
  "propn",
  "name",
]);

/** Maps AI POS drift (e.g. proper noun) to canonical enum values. */
export function normalizePartOfSpeech(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  const key = trimmed.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ");
  if (PROPER_NOUN_POS.has(key) || PROPER_NOUN_POS.has(key.replace(/ /g, "_"))) {
    return "noun";
  }
  return trimmed.toLowerCase();
}

export { isProperNounPartOfSpeech };

export const wordAnalysisStatusSchema = z.enum(["complete", "partial"]);

export const analysisStatusSchema = z.enum(["complete", "partial", "failed"]);

export const partOfSpeechSchema = z.preprocess(
  normalizePartOfSpeech,
  z.enum([
    "noun",
    "verb",
    "adjective",
    "pronoun",
    "adverb",
    "numeral",
    "preposition",
    "conjunction",
    "particle",
    "interjection",
  ]),
);

export const wordFrequencySchema = z.enum(["VERY_COMMON", "COMMON", "UNCOMMON", "RARE"]);

export const frequencyTierSchema = z.enum([
  "TOP_500",
  "TOP_1000",
  "TOP_3000",
  "BEYOND_TOP_3000",
]);

export const phraseGroupTypeSchema = z.enum([
  "COLLOCATION",
  "FIXED_EXPRESSION",
  "NATIVE_CONSTRUCTION",
]);

export const registerSchema = z.enum(["neutral", "informal", "formal", "literary", "slang"]);

export const difficultyScoreSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const lexicalTypeSchema = z.enum([
  "common_noun",
  "proper_noun",
  "verb",
  "adjective",
  "pronoun",
  "numeral",
  "particle",
  "interjection",
  "abbreviation",
  "other",
]);

function preprocessWordAnalysis(word: unknown): unknown {
  if (!word || typeof word !== "object") {
    return word;
  }

  const raw = { ...(word as Record<string, unknown>) };
  const properFromPos = isProperNounPartOfSpeech(raw.partOfSpeech);
  raw.partOfSpeech = normalizePartOfSpeech(raw.partOfSpeech);

  if (properFromPos || raw.isProperNoun === true) {
    raw.isProperNoun = true;
    if (!raw.lexicalType) {
      raw.lexicalType = "proper_noun";
    }
  }

  return raw;
}

export const wordAnalysisOutputSchema = z.preprocess(
  preprocessWordAnalysis,
  z
    .object({
    position: z.number().int().nonnegative(),
    original: z.string().min(1),
    lemma: z.string().min(1),
    stressMarked: z.string().min(1),
    stem: z.string(),
    ending: z.string(),
    partOfSpeech: partOfSpeechSchema,
    isProperNoun: z.boolean().optional(),
    lexicalType: lexicalTypeSchema.optional(),
    case: z.string().nullable().optional(),
    gender: z.string().nullable().optional(),
    number: z.string().nullable().optional(),
    tense: z.string().nullable().optional(),
    aspect: z.string().nullable().optional(),
    explanation: z.string().min(1),
    translationCanonical: z.string().min(1).optional(),
    translationAlternatives: z.array(z.string().min(1)).optional(),
    frequency: wordFrequencySchema.nullable().optional(),
    frequencyTier: frequencyTierSchema.nullable().optional(),
    analysisStatus: wordAnalysisStatusSchema.optional(),
  })
    .transform((word) => {
      const lexical = resolveWordLexicalMetadata({
        partOfSpeech: word.partOfSpeech,
        isProperNoun: word.isProperNoun,
        lexicalType: word.lexicalType as LexicalType | undefined,
      });
      return {
        ...word,
        isProperNoun: lexical.isProperNoun,
        lexicalType: lexical.lexicalType,
      };
    }),
);

export const phraseGroupAnalysisOutputSchema = z
  .object({
    type: phraseGroupTypeSchema,
    label: z.string().min(1),
    explanation: z.string().min(1),
    startPosition: z.number().int().nonnegative(),
    endPosition: z.number().int().nonnegative(),
  })
  .superRefine((group, ctx) => {
    if (group.endPosition < group.startPosition) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "endPosition must be >= startPosition",
        path: ["endPosition"],
      });
    }
  });

export const sentenceAnalysisInputSchema = z.object({
  russianText: z.string().min(1),
});

export const culturalNoteSchema = z.object({
  title: z.string().min(1),
  explanation: z.string().min(1),
});

export const syntaxTokenNodeSchema = z.object({
  position: z.number().int().nonnegative(),
  original: z.string().min(1),
  lemma: z.string().min(1),
  partOfSpeech: partOfSpeechSchema,
  headPosition: z.number().int().nonnegative().nullable(),
  relation: z.string().nullable(),
});

export const syntaxAnalysisSchema = z.object({
  tokens: z.array(syntaxTokenNodeSchema).min(1),
  structureExplanation: z.string().min(1),
});

export const sentenceAnalysisOutputSchema = z
  .object({
    russianText: z.string().min(1),
    literalTranslation: z.string().min(1),
    naturalTranslation: z.string().min(1),
    russianLogic: z.string().min(1),
    orderExplanation: z.string().min(1),
    nativeUsageNotes: z.string().min(1),
    register: registerSchema,
    difficultyScore: difficultyScoreSchema,
    words: z.array(wordAnalysisOutputSchema).default([]),
    phraseGroups: z.array(phraseGroupAnalysisOutputSchema).default([]),
    syntaxAnalysis: syntaxAnalysisSchema.optional(),
    culturalNotes: z.array(culturalNoteSchema).default([]),
    needsReview: z.boolean().optional().default(false),
    reviewMessage: z.string().nullable().optional(),
    analysisStatus: analysisStatusSchema.optional().default("complete"),
  })
  .superRefine((sentence, ctx) => {
    const wordCount = sentence.words.length;
    if (wordCount === 0) {
      return;
    }
    const positions = sentence.words.map((w) => w.position);
    const uniquePositions = new Set(positions);
    if (uniquePositions.size !== positions.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "word positions must be unique",
        path: ["words"],
      });
    }
    for (const group of sentence.phraseGroups) {
      if (group.endPosition >= wordCount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `phraseGroup endPosition ${group.endPosition} out of range (word count: ${wordCount})`,
          path: ["phraseGroups"],
        });
      }
    }
  });

export type SentenceAnalysisInput = z.infer<typeof sentenceAnalysisInputSchema>;
export type AnalysisStatus = z.infer<typeof analysisStatusSchema>;
export type WordAnalysisOutput = z.infer<typeof wordAnalysisOutputSchema>;
export type PhraseGroupAnalysisOutput = z.infer<typeof phraseGroupAnalysisOutputSchema>;
export type SentenceAnalysisOutput = z.infer<typeof sentenceAnalysisOutputSchema>;
export type CulturalNoteOutput = z.infer<typeof culturalNoteSchema>;
export type SyntaxAnalysisOutput = z.infer<typeof syntaxAnalysisSchema>;

export function warnStemEndingMismatch(word: Pick<WordAnalysisOutput, "original" | "stem" | "ending">): void {
  if (!wordFormMatchesOriginal(word.original, word.stem, word.ending)) {
    logImportPhase("parse warning: original != stem + ending (kept as-is)", {
      original: word.original,
      stem: word.stem,
      ending: word.ending,
    });
  }
}

export function parseSentenceAnalysisOutput(data: unknown): SentenceAnalysisOutput {
  return sentenceAnalysisOutputSchema.parse(data);
}

export function safeParseSentenceAnalysisOutput(
  data: unknown,
): z.SafeParseReturnType<unknown, SentenceAnalysisOutput> {
  return sentenceAnalysisOutputSchema.safeParse(data);
}

/** Sentence-level fields without strict word array validation. */
export const sentenceAnalysisShellSchema = z.object({
  russianText: z.string().min(1),
  literalTranslation: z.string().min(1),
  naturalTranslation: z.string().min(1),
  russianLogic: z.string().min(1),
  orderExplanation: z.string().min(1),
  nativeUsageNotes: z.string().min(1),
  register: registerSchema,
  difficultyScore: difficultyScoreSchema,
  words: z.array(z.unknown()).default([]),
  phraseGroups: z.array(z.unknown()).default([]),
  syntaxAnalysis: syntaxAnalysisSchema.optional(),
  culturalNotes: z.array(culturalNoteSchema).default([]),
  needsReview: z.boolean().optional().default(false),
  reviewMessage: z.string().nullable().optional(),
});

export function safeParseWordAnalysisOutput(
  data: unknown,
): z.SafeParseReturnType<unknown, WordAnalysisOutput> {
  return wordAnalysisOutputSchema.safeParse(data);
}

export function safeParsePhraseGroupAnalysisOutput(
  data: unknown,
): z.SafeParseReturnType<unknown, PhraseGroupAnalysisOutput> {
  return phraseGroupAnalysisOutputSchema.safeParse(data);
}
