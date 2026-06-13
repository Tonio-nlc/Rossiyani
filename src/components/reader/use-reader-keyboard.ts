"use client";

import { useEffect } from "react";

type ReaderKeyboardOptions = {
  enabled: boolean;
  words: Array<{ id: string; position: number }>;
  sentences: Array<{ id: string }>;
  selectedWordId: string | null;
  selectedSentenceId: string | null;
  onSelectWord: (wordId: string) => void;
  onSelectSentence: (sentenceId: string) => void;
  onClearWord: () => void;
  onOpenSearch?: () => void;
  searchOpen?: boolean;
  onCloseSearch?: () => void;
};

export function useReaderKeyboard({
  enabled,
  words,
  sentences,
  selectedWordId,
  selectedSentenceId,
  onSelectWord,
  onSelectSentence,
  onClearWord,
  onOpenSearch,
  searchOpen = false,
  onCloseSearch,
}: ReaderKeyboardOptions) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const sortedWords = [...words].sort((a, b) => a.position - b.position);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "/" && onOpenSearch) {
        e.preventDefault();
        onOpenSearch();
        return;
      }

      if (e.key === "Escape") {
        if (searchOpen && onCloseSearch) {
          e.preventDefault();
          onCloseSearch();
          return;
        }
        onClearWord();
        return;
      }

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        if (sentences.length === 0) {
          return;
        }
        e.preventDefault();
        const currentSentenceIndex = sentences.findIndex((s) => s.id === selectedSentenceId);
        const baseIndex = currentSentenceIndex >= 0 ? currentSentenceIndex : 0;
        const nextIndex =
          e.key === "ArrowDown"
            ? Math.min(baseIndex + 1, sentences.length - 1)
            : Math.max(baseIndex - 1, 0);
        const nextSentence = sentences[nextIndex];
        if (nextSentence && nextSentence.id !== selectedSentenceId) {
          onSelectSentence(nextSentence.id);
        }
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (sortedWords.length === 0) {
          return;
        }
        e.preventDefault();

        if (!selectedWordId) {
          if (e.key === "ArrowRight") {
            onSelectWord(sortedWords[0].id);
          }
          return;
        }

        const currentIndex = sortedWords.findIndex((w) => w.id === selectedWordId);
        if (currentIndex < 0) {
          return;
        }
        const next =
          e.key === "ArrowRight"
            ? sortedWords[currentIndex + 1]
            : sortedWords[currentIndex - 1];
        if (next) {
          onSelectWord(next.id);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    enabled,
    words,
    sentences,
    selectedWordId,
    selectedSentenceId,
    onSelectWord,
    onSelectSentence,
    onClearWord,
    onOpenSearch,
    searchOpen,
    onCloseSearch,
  ]);
}
