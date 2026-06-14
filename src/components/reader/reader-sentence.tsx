"use client";

import { memo } from "react";

import { SentenceBlock, type SentenceBlockWord } from "@/components/sentence/sentence-block";
import type { PartOfSpeech } from "@/types";

import { ReaderMarginPanel } from "./reader-margin-panel";
import { SentenceActions } from "./sentence-actions";
import type { ReaderTextPhraseIndex } from "@/lib/reader/build-reader-word-panel-data";
import type { WordDetailGraph } from "@/types/word-detail-graph";

type ReaderSentenceProps = {
  sentenceId: string;
  russianText: string;
  naturalTranslation: string;
  textId: string;
  textTitle: string;
  words: SentenceBlockWord[];
  fullAnalysisWordIds: Set<string>;
  selectedWordId: string | null;
  selectedWordSentenceId: string | null;
  searchMatchWordIds: Set<string>;
  searchActiveWordId: string | null;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  isActive: boolean;
  dimmed: boolean;
  onSelectSentence: () => void;
  onSelectWord: (word: SentenceBlockWord) => void;
  onHoverWord?: (wordId: string) => void;
  marginPanelProps: {
    detail: WordDetailGraph | null;
    loading?: boolean;
    textIndex: ReaderTextPhraseIndex;
    agreementTarget: string | null;
    showAllTranslations: boolean;
    onToggleAllTranslations: (value: boolean) => void;
  };
  registerRef: (node: HTMLDivElement | null) => void;
  marginRef: React.RefObject<HTMLDivElement | null>;
};

export const ReaderSentence = memo(function ReaderSentence({
  sentenceId,
  russianText,
  naturalTranslation,
  textId,
  textTitle,
  words,
  fullAnalysisWordIds,
  selectedWordId,
  selectedWordSentenceId,
  searchMatchWordIds,
  searchActiveWordId,
  showTranslation,
  onToggleTranslation,
  isActive,
  dimmed,
  onSelectSentence,
  onSelectWord,
  onHoverWord,
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
        "min-w-0 py-3 transition-opacity duration-150",
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
        fullAnalysisWordIds={fullAnalysisWordIds}
        selectedWordId={selectedWordId}
        searchMatchWordIds={searchMatchWordIds}
        searchActiveWordId={searchActiveWordId}
        onSelectWord={onSelectWord}
        onHoverWord={onHoverWord}
      />
      <SentenceActions
        sentenceRussian={russianText}
        textId={textId}
        textTitle={textTitle}
        selected={isActive}
      />
      {showMobilePanel ? (
        <div
          ref={marginRef}
          className="mt-6 border-t border-[var(--hairline)] pt-6 lg:hidden"
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
