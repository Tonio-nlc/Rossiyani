import { getAllReadingProgress } from "@/lib/reader/reading-progress";
import { getSavedReaderWords } from "@/lib/reader/saved-words";
import { getSavedSentences } from "@/lib/phrase-mining";
import type { PostReadingExercise } from "@/lib/compose/types";

const COMPLETION_PERCENT = 95;

export type CompletedReadingText = {
  textId: string;
  textTitle: string;
  percent: number;
  lastReadAt: string;
};

function resolveTextTitle(textId: string): string {
  const sentence = getSavedSentences().find((entry) => entry.sourceTextId === textId);
  if (sentence?.sourceTextTitle) {
    return sentence.sourceTextTitle;
  }

  const word = getSavedReaderWords().find((entry) => entry.textId === textId);
  if (word) {
    const fromSentence = getSavedSentences().find((entry) => entry.sourceTextId === textId);
    if (fromSentence?.sourceTextTitle) {
      return fromSentence.sourceTextTitle;
    }
  }

  return `Texte ${textId.slice(0, 8)}`;
}

export function getCompletedReadingTexts(): CompletedReadingText[] {
  const progress = getAllReadingProgress();

  return Object.values(progress)
    .filter((entry) => entry.percent >= COMPLETION_PERCENT)
    .map((entry) => ({
      textId: entry.textId,
      textTitle: resolveTextTitle(entry.textId),
      percent: entry.percent,
      lastReadAt: entry.lastReadAt,
    }))
    .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime());
}

export function buildPostReadingExercises(textId: string): PostReadingExercise[] {
  const textTitle = resolveTextTitle(textId);
  const words = getSavedReaderWords()
    .filter((entry) => entry.textId === textId)
    .slice(0, 4);
  const sentences = getSavedSentences()
    .filter((entry) => entry.sourceTextId === textId)
    .slice(0, 3);

  const exercises: PostReadingExercise[] = [];

  for (const word of words.slice(0, 2)) {
    const lemma = word.lemma ?? word.displayForm;
    exercises.push({
      id: `word-${word.id}`,
      type: "translation",
      title: `Vocabulaire : ${lemma}`,
      frenchPrompt: `Utilisez le mot « ${lemma} » dans une phrase simple en russe.`,
      hint: `Mot rencontré dans ${textTitle}`,
      textId,
      textTitle,
    });
  }

  for (const sentence of sentences.slice(0, 2)) {
    exercises.push({
      id: `reform-${sentence.id}`,
      type: "reformulation",
      title: "Reformulation",
      referenceRussian: sentence.text,
      hint: sentence.translation
        ? `Sens : ${sentence.translation}`
        : `Phrase issue de ${textTitle}`,
      textId,
      textTitle,
    });
  }

  if (sentences[0]) {
    exercises.push({
      id: `structure-${sentences[0].id}`,
      type: "structure",
      title: "Structure grammaticale",
      referenceRussian: sentences[0].text,
      frenchPrompt: `Reproduisez la structure de cette phrase avec un autre sujet ou un autre verbe.`,
      hint: sentences[0].translation || undefined,
      textId,
      textTitle,
    });
  }

  if (exercises.length === 0) {
    exercises.push({
      id: `fallback-${textId}`,
      type: "translation",
      title: "Synthèse",
      frenchPrompt: `Résumez en une phrase ce que vous retenez de « ${textTitle} ».`,
      textId,
      textTitle,
    });
  }

  return exercises.slice(0, 4);
}

export function getPostReadingExercise(
  textId: string,
  exerciseId: string,
): PostReadingExercise | null {
  return buildPostReadingExercises(textId).find((entry) => entry.id === exerciseId) ?? null;
}
