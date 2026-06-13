import { prisma } from "@/lib/prisma";

export type SentenceDetail = {
  id: string;
  textId: string;
  position: number;
  russianText: string;
  literalTranslation: string;
  naturalTranslation: string;
  russianLogic: string;
  orderExplanation: string;
  nativeUsageNotes: string;
  register: string;
  difficultyScore: number;
  needsReview: boolean;
  reviewMessage: string | null;
};

export async function getSentenceDetail(
  textId: string,
  sentenceId: string,
): Promise<SentenceDetail | null> {
  const sentence = await prisma.sentence.findFirst({
    where: { id: sentenceId, textId },
  });
  return sentence;
}
