import type { SavedDiscovery } from "@/lib/discovery/saved-discoveries";
import type { SavedReaderWord } from "@/lib/reader/saved-words";
import type { SavedSentence } from "@/types/saved-sentence";

import {
  buildExpressionReviewContent,
  buildGrammarReviewContent,
  buildVocabularyReviewContent,
  reviewSourceKey,
} from "./build-review-content";
import {
  addLocalReviewItem,
  exportLocalReviewStore,
  getLocalDueCards,
  getLocalReviewStats,
  importLocalReviewStore,
  isInLocalReview,
  removeLocalReviewItem,
  seedLocalReviewItems,
  submitLocalReviewAnswer,
} from "./local-review-store";
import type { ReviewCardContent, ReviewItemRecord, ReviewLearningState, ReviewRating } from "./types";

export {
  getLocalDueCards,
  getLocalReviewStats,
  seedLocalReviewItems,
  submitLocalReviewAnswer,
};

const STATE_LABELS: Record<ReviewLearningState, string> = {
  new: "Nouveau",
  learning: "En apprentissage",
  review: "À réviser",
  mastered: "Maîtrisé",
};

export function formatReviewState(state: ReviewLearningState): string {
  return STATE_LABELS[state];
}

export function enqueueVocabularyReview(
  word: SavedReaderWord,
  enrichment?: Parameters<typeof buildVocabularyReviewContent>[1],
): ReviewItemRecord {
  const sourceKey = reviewSourceKey("vocabulary", word.id);
  return addLocalReviewItem({
    type: "vocabulary",
    sourceKey,
    content: buildVocabularyReviewContent(word, enrichment),
  });
}

export function enqueueExpressionReview(discovery: SavedDiscovery): ReviewItemRecord {
  const sourceKey = reviewSourceKey("expression", discovery.id);
  return addLocalReviewItem({
    type: "expression",
    sourceKey,
    content: buildExpressionReviewContent(discovery),
  });
}

export function enqueueGrammarReview(sentence: SavedSentence): ReviewItemRecord {
  const sourceKey = reviewSourceKey("grammar", sentence.id);
  return addLocalReviewItem({
    type: "grammar",
    sourceKey,
    content: buildGrammarReviewContent(sentence),
  });
}

export function removeVocabularyReview(wordId: string): boolean {
  return removeLocalReviewItem(reviewSourceKey("vocabulary", wordId));
}

export function isVocabularyInReview(wordId: string): boolean {
  return isInLocalReview(reviewSourceKey("vocabulary", wordId));
}

export function findLocalReviewItem(sourceKey: string): ReviewItemRecord | null {
  seedLocalReviewItems();
  return exportLocalReviewStore().items.find((item) => item.sourceKey === sourceKey) ?? null;
}

export function findVocabularyReviewItem(wordId: string): ReviewItemRecord | null {
  return findLocalReviewItem(reviewSourceKey("vocabulary", wordId));
}

export function updateReviewContent(sourceKey: string, content: ReviewCardContent): void {
  seedLocalReviewItems();
  const store = exportLocalReviewStore();
  const item = store.items.find((entry) => entry.sourceKey === sourceKey);
  if (!item) {
    return;
  }
  item.content = content;
  importLocalReviewStore(store);
}

export type ReviewRatingAction = {
  rating: ReviewRating;
  label: string;
  hint: string;
};

export const REVIEW_RATING_ACTIONS: ReviewRatingAction[] = [
  { rating: "again", label: "À revoir", hint: "Dans quelques minutes" },
  { rating: "hard", label: "Difficile", hint: "Dans une heure" },
  { rating: "good", label: "Bien", hint: "Prochaine révision planifiée" },
  { rating: "easy", label: "Facile", hint: "Intervalle allongé" },
];
