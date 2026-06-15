"use client";

import { memo } from "react";

import { SentenceBlock, type SentenceBlockWord } from "@/components/sentence/sentence-block";
import type { WordHighlightKind } from "@/lib/reader/build-interactive-words";
import type { InteractiveWordEntry } from "@/lib/reader/build-interactive-words";
import type { PartOfSpeech } from "@/types";

import { ReaderMarginPanel } from "./reader-margin-panel";
import type { ReaderTextPhraseIndex } from "@/lib/reader/build-reader-word-panel-data";
import type { WordDetailGraph } from "@/types/word-detail-graph";

type ReaderSentenceProps = {
  sentenceId: string;
  russianText: string;
  naturalTranslation: string;
  words: SentenceBlockWord[];
  interactiveWordKinds: Map<string, WordHighlightKind>;
  selectedWordId: string | null;
  hoveredWordId: string | null;
  selectedWordSentenceId: string | null;
  searchMatchWordIds: Set<string>;
  searchActiveWordId: string | null;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  dimmed: boolean;
  onSelectSentence: () => void;
  onSelectWord: (word: SentenceBlockWord) => void;
  onHoverWord?: (word: SentenceBlockWord) => void;
  onHoverWordLeave?: () => void;
  marginPanelProps: {
    detail: WordDetailGraph | null;
    loading?: boolean;
    textIndex: ReaderTextPhraseIndex;
    textWords: InteractiveWordEntry[];
    activeWordId: string | null;
    agreementTarget: string | null;
    showAllTranslations: boolean;
    onToggleAllTranslations: (value: boolean) => void;
    onHoverWord: (entry: InteractiveWordEntry) => void;
    onSelectWord: (entry: InteractiveWordEntry) => void;
    onHoverWordLeave: () => void;
  };
  registerRef: (node: HTMLDivElement | null) => void;
  marginRef: React.RefObject<HTMLDivElement | null>;
};

export const ReaderSentence = memo(function ReaderSentence({
  sentenceId,
  russianText,
  naturalTranslation,
  words,
  interactiveWordKinds,
  selectedWordId,
  hoveredWordId,
  selectedWordSentenceId,
  searchMatchWordIds,
  searchActiveWordId,
  showTranslation,
  onToggleTranslation,
  dimmed,
  onSelectSentence,
  onSelectWord,
  onHoverWord,
  onHoverWordLeave,
  marginPanelProps,
  registerRef,
  marginRef,
}: ReaderSentenceProps) {
  const showMobilePanel = selectedWordSentenceId === sentenceId;

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
        "min-w-0 py-1.5 transition-opacity duration-150",
        dimmed ? "opacity-35" : "opacity-100",
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
      {showMobilePanel ? (
        <div
          ref={marginRef}
          className="mt-4 border-t border-[var(--hairline)] pt-4 lg:hidden"
          aria-label="Word context"
        >
          <ReaderMarginPanel {...marginPanelProps} />
        </div>
      ) : null}
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
