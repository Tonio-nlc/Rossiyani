"use client";

import { memo } from "react";

import { SentenceBlock, type SentenceBlockWord } from "@/components/sentence/sentence-block";
import type { WordHighlightKind } from "@/lib/reader/build-interactive-words";
import type { PartOfSpeech } from "@/types";

type ReaderSentenceProps = {
  sentenceId: string;
  russianText: string;
  naturalTranslation: string;
  words: SentenceBlockWord[];
  interactiveWordKinds: Map<string, WordHighlightKind>;
  selectedWordId: string | null;
  hoveredWordId: string | null;
  searchMatchWordIds: Set<string>;
  searchActiveWordId: string | null;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  dimmed: boolean;
  onSelectSentence: () => void;
  onSelectWord: (word: SentenceBlockWord) => void;
  onHoverWord?: (word: SentenceBlockWord) => void;
  onHoverWordLeave?: () => void;
  registerRef: (node: HTMLDivElement | null) => void;
};

export const ReaderSentence = memo(function ReaderSentence({
  sentenceId,
  russianText,
  naturalTranslation,
  words,
  interactiveWordKinds,
  selectedWordId,
  hoveredWordId,
  searchMatchWordIds,
  searchActiveWordId,
  showTranslation,
  onToggleTranslation,
  dimmed,
  onSelectSentence,
  onSelectWord,
  onHoverWord,
  onHoverWordLeave,
  registerRef,
}: ReaderSentenceProps) {
  return (
    <div
      ref={registerRef}
      data-sentence-id={sentenceId}
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("button, a")) {
          return;
        }
        onSelectSentence();
      }}
      className={[
        "reader-paragraph reader-ws-sentence-wrap min-w-0",
        dimmed ? "reader-ws-sentence-wrap--muted" : "reader-ws-sentence-wrap--current",
      ].join(" ")}
    >
      <SentenceBlock
        sentenceId={sentenceId}
        russianText={russianText}
        naturalTranslation={naturalTranslation}
        showTranslation={showTranslation}
        onToggleTranslation={onToggleTranslation}
        words={words}
        interactiveWordKinds={interactiveWordKinds}
        selectedWordId={selectedWordId}
        hoveredWordId={hoveredWordId}
        searchMatchWordIds={searchMatchWordIds}
        searchActiveWordId={searchActiveWordId}
        onSelectWord={onSelectWord}
        onHoverWord={onHoverWord}
        onHoverWordLeave={onHoverWordLeave}
      />
    </div>
  );
});

export function mapSentenceWords(
  words: Array<{
    id: string;
    position: number;
    original: string;
    stressMarked: string;
    stem: string;
    ending: string;
    partOfSpeech: string;
    case: string | null;
    lemma: string;
    explanation: string;
    formId: string | null;
  }>,
): SentenceBlockWord[] {
  return words.map((word) => ({
    ...word,
    partOfSpeech: word.partOfSpeech as PartOfSpeech,
    formId: word.formId,
  }));
}
