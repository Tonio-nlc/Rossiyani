"use client";

import { memo } from "react";

import { SentenceBlock, type SentenceBlockWord } from "@/components/sentence/sentence-block";
import type { WordHighlightKind } from "@/lib/reader/build-interactive-words";
import type { PartOfSpeech } from "@/types";

import { SentenceListenButton } from "./sentence-listen-button";

type ReaderSentenceProps = {
  sentenceId: string;
  russianText: string;
  literalTranslation: string;
  naturalTranslation: string;
  words: SentenceBlockWord[];
  interactiveWordKinds: Map<string, WordHighlightKind>;
  selectedWordId: string | null;
  hoveredWordId: string | null;
  searchMatchWordIds: Set<string>;
  searchActiveWordId: string | null;
  showTranslation: boolean;
  showTranslationToggle: boolean;
  showInterlinear: boolean;
  onToggleTranslation: () => void;
  showPatternEcho?: boolean;
  isPlaying?: boolean;
  onSelectSentence: () => void;
  onSelectWord: (word: SentenceBlockWord) => void;
  onHoverWord?: (word: SentenceBlockWord) => void;
  onHoverWordLeave?: () => void;
  registerRef: (node: HTMLDivElement | null) => void;
};

export const ReaderSentence = memo(function ReaderSentence({
  sentenceId,
  russianText,
  literalTranslation,
  naturalTranslation,
  words,
  interactiveWordKinds,
  selectedWordId,
  hoveredWordId,
  searchMatchWordIds,
  searchActiveWordId,
  showTranslation,
  showTranslationToggle,
  showInterlinear,
  onToggleTranslation,
  showPatternEcho = false,
  isPlaying = false,
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
        "reader-ws-sentence-wrap--current",
        isPlaying ? "reader-ws-sentence-wrap--playing" : "",
        showPatternEcho ? "reader-ws-sentence-wrap--pattern-echo" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <SentenceBlock
        sentenceId={sentenceId}
        russianText={russianText}
        literalTranslation={literalTranslation}
        naturalTranslation={naturalTranslation}
        showTranslation={showTranslation}
        showTranslationToggle={showTranslationToggle}
        showInterlinear={showInterlinear}
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
      <div className="reader-ws-sentence-actions">
        <SentenceListenButton sentenceId={sentenceId} />
      </div>
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
    isProperNoun?: boolean | null;
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
