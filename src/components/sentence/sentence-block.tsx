"use client";

import type { ReactNode } from "react";
import { memo } from "react";

import { buildSentenceDisplay } from "@/lib/formatting/build-sentence-display";
import type { WordHighlightKind } from "@/lib/reader/build-interactive-words";
import type { PartOfSpeech } from "@/types";

import { resolveSentenceBlockWord } from "../reader/reader-word-utils";
import { SentenceTranslationToggle } from "../reader/sentence-translation-toggle";
import { WordToken } from "../word/word-token";
import { SentenceInterlinearTranslation } from "./sentence-interlinear-translation";
import { SentenceNaturalTranslation } from "./sentence-natural-translation";

export type SentenceBlockWord = {
  id: string;
  position: number;
  original: string;
  stressMarked: string;
  stem: string;
  ending: string;
  partOfSpeech: PartOfSpeech;
  isProperNoun?: boolean | null;
  case: string | null;
  lemma: string;
  explanation: string;
  formId: string | null;
};

type SentenceBlockProps = {
  sentenceId: string;
  russianText: string;
  literalTranslation?: string | null;
  naturalTranslation?: string | null;
  showTranslation?: boolean;
  showTranslationToggle?: boolean;
  showInterlinear?: boolean;
  onToggleTranslation?: () => void;
  words: SentenceBlockWord[];
  interactiveWordKinds: Map<string, WordHighlightKind>;
  patternBearerWordIds?: Set<string>;
  guideLinkedWordIds?: Set<string>;
  selectedWordId: string | null;
  hoveredWordId?: string | null;
  searchMatchWordIds?: Set<string>;
  searchActiveWordId?: string | null;
  onSelectWord: (word: SentenceBlockWord) => void;
  onHoverWord?: (word: SentenceBlockWord) => void;
  onHoverWordLeave?: () => void;
  insightSlot?: ReactNode;
};

export const SentenceBlock = memo(function SentenceBlock({
  sentenceId,
  russianText,
  literalTranslation,
  naturalTranslation,
  showTranslation = false,
  showTranslationToggle = true,
  showInterlinear = false,
  onToggleTranslation,
  words,
  interactiveWordKinds,
  patternBearerWordIds,
  guideLinkedWordIds,
  selectedWordId,
  hoveredWordId = null,
  searchMatchWordIds,
  searchActiveWordId = null,
  onSelectWord,
  onHoverWord,
  onHoverWordLeave,
  insightSlot = null,
}: SentenceBlockProps) {
  const wordByPosition = new Map(words.map((word) => [word.position, word]));
  const segments = buildSentenceDisplay(
    russianText,
    words.map((word) => ({ position: word.position, original: word.original })),
  );
  const hasTranslation = Boolean(naturalTranslation?.trim());
  const hasLiteral = Boolean(literalTranslation?.trim());

  return (
    <div role="group" aria-label="Phrase" className="reader-sentence-block reader-ws-sentence">
      <p className="reader-sentence-block__russian break-russian">
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
          const isPatternBearer = patternBearerWordIds?.has(word.id) ?? false;
          const highlightKind: WordHighlightKind | null = isPatternBearer
            ? "pattern"
            : (interactiveWordKinds.get(word.id) ?? null);
          const interactive = !isOrphan;
          const guideLinked = guideLinkedWordIds?.has(word.id) ?? false;

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
                guideLinked={guideLinked}
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

      <SentenceInterlinearTranslation
        text={literalTranslation ?? ""}
        visible={showInterlinear && hasLiteral}
      />

      {showTranslationToggle && onToggleTranslation ? (
        <SentenceTranslationToggle
          expanded={showTranslation}
          onToggle={onToggleTranslation}
          hasTranslation={hasTranslation}
        />
      ) : null}

      {hasTranslation ? (
        <div
          className={[
            "grid transition-[grid-template-rows,opacity] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            showTranslation ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
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

      {insightSlot}
    </div>
  );
});
