"use client";

import { memo } from "react";

import { buildSentenceDisplay } from "@/lib/formatting/build-sentence-display";
import type { PartOfSpeech } from "@/types";

import { resolveSentenceBlockWord } from "../reader/reader-word-utils";
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
  words: SentenceBlockWord[];
  fullAnalysisWordIds: Set<string>;
  selectedWordId: string | null;
  searchMatchWordIds?: Set<string>;
  searchActiveWordId?: string | null;
  onSelectWord: (word: SentenceBlockWord) => void;
};

export const SentenceBlock = memo(function SentenceBlock({
  sentenceId,
  russianText,
  naturalTranslation,
  showTranslation = true,
  words,
  fullAnalysisWordIds,
  selectedWordId,
  searchMatchWordIds,
  searchActiveWordId = null,
  onSelectWord,
}: SentenceBlockProps) {
  const wordByPosition = new Map(words.map((word) => [word.position, word]));
  const segments = buildSentenceDisplay(
    russianText,
    words.map((word) => ({ position: word.position, original: word.original })),
  );

  return (
    <div role="group" aria-label="Phrase">
      <p className="break-russian font-reader text-[clamp(1.375rem,4vw,1.85rem)] leading-[1.65] text-[var(--ink)] sm:leading-[2.1]">
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
                searchMatch={searchMatchWordIds?.has(word.id)}
                searchActive={searchActiveWordId === word.id}
                hasFullAnalysis={fullAnalysisWordIds.has(word.id)}
                onClick={() => onSelectWord(word)}
              />
            </span>
          );
        })}
      </p>
      {showTranslation && naturalTranslation ? (
        <SentenceNaturalTranslation sentenceId={sentenceId} text={naturalTranslation} />
      ) : null}
    </div>
  );
});
