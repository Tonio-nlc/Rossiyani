import type { HomeJournalData } from "@/features/home";
import { contextTranslationPath } from "@/lib/practice/constants";

export type TodaysPracticeCard = {
  id: "sentence" | "context" | "vocabulary";
  title: string;
  description: string;
  progressLabel: string;
  href: string;
  cta: string;
};

type BuildTodaysPracticeInput = {
  journal: HomeJournalData;
  composePhraseCount: number;
  contextLessonCount: number;
};

export function buildTodaysPractice(input: BuildTodaysPracticeInput): TodaysPracticeCard[] {
  const reviewTotal = input.journal.review.words.length + input.journal.review.moreCount;
  const sentenceRemaining = Math.max(1, 5 - (input.composePhraseCount % 5));
  const contextRemaining = Math.max(1, 4 - (input.contextLessonCount % 4));

  return [
    {
      id: "sentence",
      title: "Sentence Builder",
      description: "Compose Russian sentences from structures you encounter in your readings.",
      progressLabel: `${sentenceRemaining} exercise${sentenceRemaining === 1 ? "" : "s"} remaining`,
      href: "/practice?mode=sentence",
      cta: "Start building →",
    },
    {
      id: "context",
      title: "Context Translation",
      description: "Translate meaning in context — not word by word.",
      progressLabel: `${contextRemaining} exercise${contextRemaining === 1 ? "" : "s"} remaining`,
      href: contextTranslationPath(),
      cta: "Translate now →",
    },
    {
      id: "vocabulary",
      title: "Vocabulary Review",
      description: "Revisit words from your library before they fade.",
      progressLabel:
        reviewTotal > 0
          ? `${reviewTotal} word${reviewTotal === 1 ? "" : "s"} waiting for review`
          : "Fresh words ready to explore",
      href: input.journal.reviewHref,
      cta: "Review words →",
    },
  ];
}
