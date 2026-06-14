import type { KnowledgeForm, KnowledgeLemma } from "@prisma/client";

import {
  endingLookupKey,
  formLookupKey,
  phraseLookupKey,
  sentenceLookupKey,
} from "@/lib/normalization/russian-key";
import { prisma } from "@/lib/prisma";
import { parseSentenceAnalysisOutput } from "@/services/ai/schemas";
import type {
  KnowledgeEndingLookupResult,
  KnowledgeFormLookupResult,
  KnowledgePhraseLookupResult,
  KnowledgeSentenceLookupResult,
} from "@/types/linguistic-library";

type FormWithLemma = KnowledgeForm & { lemma: KnowledgeLemma };

/**
 * Reads the LinguisticLibrary before any AI call.
 * F0: sentence cache returns complete hits; partial merge is a later phase.
 */
export class KnowledgeLookupService {
  async lookupSentence(russianText: string): Promise<KnowledgeSentenceLookupResult> {
    const key = sentenceLookupKey(russianText);
    const row = await prisma.knowledgeSentence.findUnique({
      where: { russianTextKey: key },
    });

    if (!row) {
      return { hit: false, complete: false, analysis: null, source: "miss" };
    }

    await prisma.knowledgeSentence.update({
      where: { id: row.id },
      data: { hitCount: { increment: 1 } },
    });

    const analysis = parseSentenceAnalysisOutput(JSON.parse(row.analysisJson));

    return {
      hit: true,
      complete: !row.needsReview,
      analysis,
      source: "cache",
    };
  }

  /** Batch sentence cache lookup — one query for many texts. */
  async lookupSentencesBatch(
    russianTexts: string[],
  ): Promise<KnowledgeSentenceLookupResult[]> {
    if (russianTexts.length === 0) {
      return [];
    }

    const keyByText = new Map(
      russianTexts.map((text) => [text, sentenceLookupKey(text)] as const),
    );
    const keys = [...new Set(keyByText.values())];

    const rows = await prisma.knowledgeSentence.findMany({
      where: { russianTextKey: { in: keys } },
    });

    const rowByKey = new Map(rows.map((row) => [row.russianTextKey, row]));

    return russianTexts.map((text) => {
      const key = keyByText.get(text)!;
      const row = rowByKey.get(key);

      if (!row) {
        return { hit: false, complete: false, analysis: null, source: "miss" as const };
      }

      const analysis = parseSentenceAnalysisOutput(JSON.parse(row.analysisJson));

      return {
        hit: true,
        complete: !row.needsReview,
        analysis,
        source: "cache" as const,
      };
    });
  }

  async lookupForm(original: string): Promise<KnowledgeFormLookupResult | null> {
    const key = formLookupKey(original);
    const row = await prisma.knowledgeForm.findUnique({
      where: { originalKey: key },
      include: { lemma: true },
    });

    if (!row) {
      return null;
    }

    await prisma.knowledgeForm.update({
      where: { id: row.id },
      data: { hitCount: { increment: 1 } },
    });

    return mapFormRow(row);
  }

  async lookupPhrase(label: string): Promise<KnowledgePhraseLookupResult | null> {
    const key = phraseLookupKey(label);
    const row = await prisma.knowledgePhrase.findUnique({
      where: { labelKey: key },
    });

    if (!row) {
      return null;
    }

    await prisma.knowledgePhrase.update({
      where: { id: row.id },
      data: { hitCount: { increment: 1 } },
    });

    return {
      id: row.id,
      label: row.label,
      type: row.type,
      explanation: row.explanation,
      hitCount: row.hitCount + 1,
    };
  }

  async lookupEnding(
    ending: string,
    grammaticalCase?: string | null,
  ): Promise<KnowledgeEndingLookupResult | null> {
    if (!ending) {
      return null;
    }

    const key = endingLookupKey(ending, grammaticalCase);
    const row = await prisma.knowledgeEnding.findUnique({
      where: { endingKey: key },
    });

    if (!row) {
      return null;
    }

    await prisma.knowledgeEnding.update({
      where: { id: row.id },
      data: { hitCount: { increment: 1 } },
    });

    return {
      id: row.id,
      ending: row.ending,
      caseKey: row.caseKey,
      partOfSpeech: row.partOfSpeech,
      explanationFr: row.explanationFr,
      hitCount: row.hitCount + 1,
    };
  }
}

function mapFormRow(row: FormWithLemma): KnowledgeFormLookupResult {
  return {
    id: row.id,
    lemmaId: row.lemmaId,
    original: row.original,
    stressMarked: row.stressMarked,
    stem: row.stem,
    ending: row.ending,
    partOfSpeech: row.partOfSpeech,
    case: row.case,
    gender: row.gender,
    number: row.number,
    tense: row.tense,
    aspect: row.aspect,
    explanation: row.explanation,
    hitCount: row.hitCount,
    lemma: {
      id: row.lemma.id,
      lemma: row.lemma.lemma,
      partOfSpeech: row.lemma.partOfSpeech,
      stressMarked: row.lemma.stressMarked,
      frequency: row.lemma.frequency,
      frequencyTier: row.lemma.frequencyTier,
    },
  };
}

export const knowledgeLookupService = new KnowledgeLookupService();
