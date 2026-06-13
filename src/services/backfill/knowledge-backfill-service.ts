import { prisma } from "@/lib/prisma";
import { linguisticLibraryIndexer } from "@/services/linguistic-library";
import { knowledgeGraphService } from "@/services/knowledge-graph";
import type { BackfillReport } from "@/types/import-pipeline";

import { reconstructAnalysisFromSentence } from "./reconstruct-analysis";

export type BackfillOptions = {
  textIds?: string[];
  dryRun?: boolean;
  batchSize?: number;
};

/**
 * Backfills KnowledgeGraph + LinguisticLibrary from existing Text/Sentence rows.
 * Idempotent — safe to run twice.
 */
export class KnowledgeBackfillService {
  async run(options?: BackfillOptions): Promise<BackfillReport> {
    const start = Date.now();
    const report: BackfillReport = {
      textsProcessed: 0,
      sentencesProcessed: 0,
      wordsIndexed: 0,
      occurrencesCreated: 0,
      occurrencesSkipped: 0,
      phraseOccurrencesCreated: 0,
      conceptsLinked: 0,
      phrasesIndexed: 0,
      executionTimeMs: 0,
      errors: [],
    };

    const texts = options?.textIds?.length
      ? await prisma.text.findMany({
          where: { id: { in: options.textIds } },
          include: {
            sentences: {
              include: { words: true, phraseGroups: true },
              orderBy: { position: "asc" },
            },
          },
        })
      : await prisma.text.findMany({
          include: {
            sentences: {
              include: { words: true, phraseGroups: true },
              orderBy: { position: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        });

    for (const text of texts) {
      report.textsProcessed += 1;

      for (const sentence of text.sentences) {
        try {
          const analysis = reconstructAnalysisFromSentence(sentence);
          report.sentencesProcessed += 1;
          report.wordsIndexed += analysis.words.length;
          report.phrasesIndexed += analysis.phraseGroups.length;

          if (options?.dryRun) {
            continue;
          }

          await linguisticLibraryIndexer.indexFromAnalysis(analysis);

          const mergeResult = await knowledgeGraphService.mergeOccurrence({
            analysis,
            textId: text.id,
            textTitle: text.title,
            sentenceId: sentence.id,
            words: sentence.words.map((w) => ({
              id: w.id,
              position: w.position,
              original: w.original,
            })),
          });

          report.occurrencesCreated += mergeResult.occurrencesCreated;
          report.occurrencesSkipped += mergeResult.occurrencesSkipped;
          report.phraseOccurrencesCreated += mergeResult.phraseOccurrencesCreated;
          report.conceptsLinked += mergeResult.conceptsLinked;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Erreur backfill inconnue";
          report.errors.push(`Text ${text.id} sentence ${sentence.id}: ${message}`);
        }
      }
    }

    report.executionTimeMs = Date.now() - start;
    return report;
  }
}

export const knowledgeBackfillService = new KnowledgeBackfillService();
