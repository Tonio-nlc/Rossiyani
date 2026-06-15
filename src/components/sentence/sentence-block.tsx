"use client";

import { memo } from "react";

import { buildSentenceDisplay } from "@/lib/formatting/build-sentence-display";
import type { WordHighlightKind } from "@/lib/reader/build-interactive-words";
import type { PartOfSpeech } from "@/types";

import { resolveSentenceBlockWord } from "../reader/reader-word-utils";
import { SentenceTranslationToggle } from "../reader/sentence-translation-toggle";
import { WordToken } from "../word/word-token";
import { SentenceNaturalTranslation } from "./sentence-natural-translation";

export type SentenceBlockWord = {
  id: string;
  position: number;
  original: string;
  stressMarked: string;
  stem: string;
  ending: string;
  partOfSpeech: PartOfSpeech;
  case: string | null;
  lemma: string;
  explanation: string;
  formId: string | null;
};

type SentenceBlockProps = {
  sentenceId: string;
  russianText: string;
  naturalTranslation?: string | null;
  showTranslation?: boolean;
  onToggleTranslation?: () => void;
  words: SentenceBlockWord[];
  interactiveWordKinds: Map<string, WordHighlightKind>;
  selectedWordId: string | null;
  hoveredWordId?: string | null;
  searchMatchWordIds?: Set<string>;
  searchActiveWordId?: string | null;
  onSelectWord: (word: SentenceBlockWord) => void;
  onHoverWord?: (word: SentenceBlockWord) => void;
  onHoverWordLeave?: () => void;
};

export const SentenceBlock = memo(function SentenceBlock({
  sentenceId,
  russianText,
  naturalTranslation,
  showTranslation = false,
  onToggleTranslation,
  words,
  interactiveWordKinds,
  selectedWordId,
  hoveredWordId = null,
  searchMatchWordIds,
  searchActiveWordId = null,
  onSelectWord,
  onHoverWord,
  onHoverWordLeave,
}: SentenceBlockProps) {
  const wordByPosition = new Map(words.map((word) => [word.position, word]));
  const segments = buildSentenceDisplay(
    russianText,
    words.map((word) => ({ position: word.position, original: word.original })),
  );
  const hasTranslation = Boolean(naturalTranslation?.trim());

  return (
    <div role="group" aria-label="Phrase" className="max-w-[70ch]">
      <p className="break-russian font-reader text-[clamp(1.375rem,4vw,1.85rem)] leading-[1.55] text-[var(--ink)] sm:leading-[1.65]">
        {segments.map((segment, index) => {
          if (segment.type === "punctuation") {
            return (
              <span key={`p-${index}`} className="text-[var(--ink)]">
                {segment.text}
              </span>
            );
          }

          const word = resolveSentenceBlockWord(sentenceId, segment, wordByPosition);
          const isOrphan = !wordByPosition.has(segment.position);
          const highlightKind = interactiveWordKinds.get(word.id) ?? null;
          const interactive = highlightKind !== null;

          return (
            <span
              key={isOrphan ? `orphan-${index}-${word.id}` : word.id}
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <WordToken
                wordId={word.id}
                stressMarked={word.stressMarked}
                stem={word.stem}
                ending={word.ending}
                partOfSpeech={word.partOfSpeech}
                grammaticalCase={word.case}
                selected={selectedWordId === word.id}
                hovered={hoveredWordId === word.id}
                searchMatch={searchMatchWordIds?.has(word.id)}
                searchActive={searchActiveWordId === word.id}
                interactive={interactive}
                highlightKind={highlightKind}
                onClick={() => onSelectWord(word)}
                onPointerEnter={
                  interactive && onHoverWord ? () => onHoverWord(word) : undefined
                }
                onPointerLeave={interactive ? onHoverWordLeave : undefined}
              />
            </span>
          );
        })}
      </p>
      {onToggleTranslation ? (
        <SentenceTranslationToggle
          expanded={showTranslation}
          onToggle={onToggleTranslation}
          hasTranslation={hasTranslation}
        />
      ) : null}
      {hasTranslation ? (
        <div
          className={[
            "grid transition-[grid-template-rows] duration-300 ease-out",
            showTranslation ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          ].join(" ")}
          aria-hidden={!showTranslation}
        >
          <div className="overflow-hidden">
            <SentenceNaturalTranslation
              sentenceId={sentenceId}
              text={naturalTranslation!}
              visible={showTranslation}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
});
