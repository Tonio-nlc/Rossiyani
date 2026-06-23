export type SavedSentence = {
  id: string;
  text: string;
  translation: string;
  sourceTextId: string;
  sourceTextTitle: string;
  collection: string;
  createdAt: string;
  reviewCount?: number;
  lastReviewedAt?: string | null;
  nextReviewAt?: string | null;
};

export type SavedSentenceInput = Omit<
  SavedSentence,
  "id" | "createdAt" | "reviewCount" | "lastReviewedAt" | "nextReviewAt"
>;
