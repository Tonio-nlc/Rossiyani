import { prisma } from "@/lib/prisma";
import { mapSentence, mapWordInstance } from "@/domain/mappers";
import type { ConceptSummary } from "@/domain/entities/concept";
import type { CulturalNote, SyntaxAnalysis } from "@/domain/pipeline";
import { knowledgeGraphService } from "@/services/knowledge-graph";

export type WordDetailFromDb = {
  wordId: string;
  sentenceId: string;
  position: number;
  original: string;
  explanation: string;
  lemma: string | null;
  partOfSpeech: string | null;
  ending: string | null;
  grammaticalCase: string | null;
  formId: string | null;
  concepts: ConceptSummary[];
};

export type SentenceDetailFromDb = {
  sentenceId: string;
  textId: string;
  russianText: string;
  literalTranslation: string;
  naturalTranslation: string;
  russianLogic: string;
  orderExplanation: string;
  nativeUsageNotes: string;
  syntaxAnalysis: SyntaxAnalysis | null;
  culturalNotes: CulturalNote[];
  words: WordDetailFromDb[];
};

/**
 * Loads full word detail from DB + Knowledge Graph.
 * Called on word click — never invokes AI.
 */
export async function getWordDetailFromDb(wordId: string): Promise<WordDetailFromDb | null> {
  const word = await prisma.word.findUnique({
    where: { id: wordId },
    include: {
      form: {
        include: {
          lemma: {
            include: { conceptLinks: { include: { concept: true } } },
          },
        },
      },
    },
  });

  if (!word) {
    return null;
  }

  const form = word.form;
  const lemma = form?.lemma ?? null;

  let ending = null;
  if (word.ending) {
    ending = await prisma.knowledgeEnding.findFirst({
      where: { ending: word.ending, caseKey: word.case ?? "_" },
    });
  }

  const concepts: ConceptSummary[] =
    lemma?.conceptLinks.map((link) => ({
      id: link.concept.id,
      conceptKey: link.concept.conceptKey,
      title: link.concept.title,
      canonicalExplanation: link.concept.canonicalExplanation,
      category: link.concept.category,
    })) ?? [];

  const mapped = mapWordInstance(word, form, lemma, ending);

  return {
    wordId: word.id,
    sentenceId: word.sentenceId,
    position: word.position,
    original: word.original,
    explanation: mapped.explanation,
    lemma: mapped.lemma?.lemma ?? word.lemma,
    partOfSpeech: word.partOfSpeech,
    ending: word.ending,
    grammaticalCase: word.case,
    formId: word.formId,
    concepts,
  };
}

/**
 * Loads sentence detail with all word references resolved from DB.
 * No AI.
 */
export async function getSentenceDetailFromDb(
  sentenceId: string,
): Promise<SentenceDetailFromDb | null> {
  const sentence = await prisma.sentence.findUnique({
    where: { id: sentenceId },
    include: {
      words: {
        orderBy: { position: "asc" },
        include: {
          form: {
            include: {
              lemma: {
                include: { conceptLinks: { include: { concept: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!sentence) {
    return null;
  }

  const mapped = mapSentence({
    id: sentence.id,
    textId: sentence.textId,
    position: sentence.position,
    russianText: sentence.russianText,
    literalTranslation: sentence.literalTranslation,
    naturalTranslation: sentence.naturalTranslation,
    russianLogic: sentence.russianLogic,
    orderExplanation: sentence.orderExplanation,
    nativeUsageNotes: sentence.nativeUsageNotes,
    register: sentence.register,
    difficultyScore: sentence.difficultyScore as 1 | 2 | 3 | 4 | 5,
    needsReview: sentence.needsReview,
    reviewMessage: sentence.reviewMessage,
    syntaxAnalysisJson: sentence.syntaxAnalysisJson,
    culturalNotesJson: sentence.culturalNotesJson,
  });

  const words: WordDetailFromDb[] = await Promise.all(
    sentence.words.map(async (word) => {
      const detail = await getWordDetailFromDb(word.id);
      return detail!;
    }),
  );

  return {
    sentenceId: sentence.id,
    textId: sentence.textId,
    russianText: mapped.russianText,
    literalTranslation: mapped.literalTranslation,
    naturalTranslation: mapped.naturalTranslation,
    russianLogic: mapped.russianLogic,
    orderExplanation: mapped.orderExplanation,
    nativeUsageNotes: mapped.nativeUsageNotes,
    syntaxAnalysis: mapped.syntaxAnalysis,
    culturalNotes: mapped.culturalNotes,
    words,
  };
}

/**
 * Loads lemma graph for reader side panel — no AI.
 */
export async function getLemmaDetailFromDb(lemma: string, partOfSpeech: string) {
  return knowledgeGraphService.getLemmaGraph(lemma, partOfSpeech as never);
}
