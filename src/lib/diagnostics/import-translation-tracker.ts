import { prisma } from "@/lib/prisma";
import {
  lookupDictionaryTranslation,
  resolveImportWordTranslation,
} from "@/lib/import/word-translation";
import type { SentenceAnalysisOutput } from "@/services/ai/schemas";
import type { PartOfSpeech } from "@/types/domain";

export type WordImportLogEntry = {
  original: string;
  lemma: string;
  aiTranslation: string | null;
  knowledgeTranslation: string | null;
  dictionaryTranslation: string | null;
  storedTranslation: string | null;
  finalTranslation: string;
};

export type SentenceImportStats = {
  sentenceIndex: number;
  wordCount: number;
  aiTranslations: number;
  storedTranslations: number;
  dictionaryHits: number;
  dictionaryFallback: number;
  missingTranslations: number;
  knowledgeConcepts: number;
};

export type ImportTranslationSummary = {
  sentences: number;
  words: number;
  aiTranslationsGenerated: number;
  storedTranslations: number;
  knowledgeHits: number;
  dictionaryFallback: number;
  missingTranslations: number;
  aiCallsSkippedEmptySegments: number;
  warnings: number;
};

export class ImportTranslationTracker {
  private readonly summary: ImportTranslationSummary = {
    sentences: 0,
    words: 0,
    aiTranslationsGenerated: 0,
    storedTranslations: 0,
    knowledgeHits: 0,
    dictionaryFallback: 0,
    missingTranslations: 0,
    aiCallsSkippedEmptySegments: 0,
    warnings: 0,
  };

  recordSkippedSegment(): void {
    this.summary.aiCallsSkippedEmptySegments += 1;
  }

  recordWarning(): void {
    this.summary.warnings += 1;
  }

  async recordSentence(input: {
    sentenceIndex: number;
    analysis: SentenceAnalysisOutput;
    knowledgeConcepts: number;
  }): Promise<SentenceImportStats> {
    const { sentenceIndex, analysis, knowledgeConcepts } = input;
    const words = [...analysis.words].sort((a, b) => a.position - b.position);

    const knowledgeByLemma = await loadKnowledgeTranslations(
      words.map((word) => ({
        lemma: word.lemma,
        partOfSpeech: word.partOfSpeech,
      })),
    );

    let aiTranslations = 0;
    let storedTranslations = 0;
    let dictionaryHits = 0;
    let dictionaryFallback = 0;
    let missingTranslations = 0;

    for (const word of words) {
      const aiTranslation = word.translationCanonical?.trim() || null;
      const knowledgeTranslation =
        knowledgeByLemma.get(lemmaKey(word.lemma, word.partOfSpeech)) ?? null;
      const dictionaryTranslation = lookupDictionaryTranslation(word.original, word.lemma);
      const storedTranslation = aiTranslation;
      const finalTranslation = resolveImportWordTranslation({
        storedTranslation,
        knowledgeTranslation,
        dictionaryTranslation,
      });

      if (aiTranslation) {
        aiTranslations += 1;
        this.summary.aiTranslationsGenerated += 1;
      }
      if (storedTranslation) {
        storedTranslations += 1;
        this.summary.storedTranslations += 1;
      }
      if (knowledgeTranslation) {
        this.summary.knowledgeHits += 1;
      }
      if (dictionaryTranslation) {
        dictionaryHits += 1;
        if (!storedTranslation && !knowledgeTranslation) {
          dictionaryFallback += 1;
          this.summary.dictionaryFallback += 1;
        }
      }
      if (finalTranslation === "—") {
        missingTranslations += 1;
        this.summary.missingTranslations += 1;
      }

      logWordImport({
        original: word.original,
        lemma: word.lemma,
        aiTranslation,
        knowledgeTranslation,
        dictionaryTranslation,
        storedTranslation,
        finalTranslation,
      });
    }

    this.summary.sentences += 1;
    this.summary.words += words.length;

    const stats: SentenceImportStats = {
      sentenceIndex,
      wordCount: words.length,
      aiTranslations,
      storedTranslations,
      dictionaryHits,
      dictionaryFallback,
      missingTranslations,
      knowledgeConcepts,
    };

    logSentenceImportStats(stats);
    return stats;
  }

  getSummary(): ImportTranslationSummary {
    return { ...this.summary };
  }

  logFinalSummary(): void {
    const s = this.summary;
    console.log(`
================================================

IMPORT SUMMARY

Sentences: ${s.sentences}

Words: ${s.words}

AI translations generated: ${s.aiTranslationsGenerated}

Stored translations: ${s.storedTranslations}

Knowledge hits: ${s.knowledgeHits}

Dictionary fallback: ${s.dictionaryFallback}

Missing translations: ${s.missingTranslations}

AI calls skipped (empty segments): ${s.aiCallsSkippedEmptySegments}

Warnings: ${s.warnings}

================================================
`);
  }
}

export function logWordImport(entry: WordImportLogEntry): void {
  console.log(`
--------------------------------

WORD IMPORT

original: ${entry.original}
lemma: ${entry.lemma}

AI translation: ${entry.aiTranslation ?? "—"}
Knowledge translation: ${entry.knowledgeTranslation ?? "—"}
Dictionary translation: ${entry.dictionaryTranslation ?? "—"}

Stored translation: ${entry.storedTranslation ?? "—"}

Final translation: ${entry.finalTranslation}

--------------------------------
`);
}

export function logSentenceImportStats(stats: SentenceImportStats): void {
  console.log(`
------------------------------------------------

Sentence ${stats.sentenceIndex}

Words: ${stats.wordCount}

AI translations: ${stats.aiTranslations}/${stats.wordCount}

Stored translations: ${stats.storedTranslations}/${stats.wordCount}

Dictionary hits: ${stats.dictionaryHits}

Dictionary fallback: ${stats.dictionaryFallback}

Missing translations: ${stats.missingTranslations}

Knowledge concepts: ${stats.knowledgeConcepts}

------------------------------------------------
`);
}

function lemmaKey(lemma: string, partOfSpeech: PartOfSpeech): string {
  return `${lemma.toLowerCase()}::${partOfSpeech}`;
}

async function loadKnowledgeTranslations(
  words: Array<{ lemma: string; partOfSpeech: PartOfSpeech }>,
): Promise<Map<string, string>> {
  const unique = new Map<string, { lemma: string; partOfSpeech: PartOfSpeech }>();
  for (const word of words) {
    unique.set(lemmaKey(word.lemma, word.partOfSpeech), word);
  }

  if (unique.size === 0) {
    return new Map();
  }

  const rows = await prisma.knowledgeLemma.findMany({
    where: {
      OR: [...unique.values()].map((word) => ({
        lemma: word.lemma,
        partOfSpeech: word.partOfSpeech,
      })),
    },
    select: {
      lemma: true,
      partOfSpeech: true,
      frenchComparison: true,
    },
  });

  const map = new Map<string, string>();
  for (const row of rows) {
    const trimmed = row.frenchComparison?.trim();
    if (trimmed) {
      map.set(lemmaKey(row.lemma, row.partOfSpeech as PartOfSpeech), trimmed);
    }
  }
  return map;
}
