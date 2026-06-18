"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getCollectionName } from "@/content/collections";
import type { ReaderTextData } from "@/features/texts";
import { setLastReadTextId } from "@/lib/last-read-text";
import type { ReaderSearchEntry } from "@/lib/reader/build-reader-search-index";
import {
  buildInteractiveWordsBySentence,
  buildTextWordIndex,
} from "@/lib/reader/build-interactive-words";
import { buildTextIntroduction } from "@/lib/reader/build-text-introduction";
import { buildReaderTextPhraseIndex } from "@/lib/reader/build-reader-word-panel-data";
import { buildReadingSessionSummary } from "@/lib/reader/build-reading-session-summary";
import type { ReaderWordSnapshot } from "@/lib/reader/build-minimal-word-detail";
import { getTextReadingProgress } from "@/lib/reader/reading-progress";
import type { PartOfSpeech } from "@/types";
import { prefetchWordDetail } from "@/lib/reader/reader-word-detail-store";

import { ReaderAboutText } from "./reader-about-text";
import { ReaderCompletionCard } from "./reader-completion-card";
import { ReaderHeader } from "./reader-header";
import { ReaderInTextSearch } from "./reader-in-text-search";
import { ReaderMarginPanel } from "./reader-margin-panel";
import { mapSentenceWords, ReaderSentence } from "./reader-sentence";
import { isSentenceAnalyzing, ReaderSentenceAnalyzing } from "./reader-sentence-analyzing";
import { ReaderWordFloatingSheet } from "./reader-word-floating-sheet";
import { toReaderWordSnapshot } from "./reader-word-utils";
import { useFocusMode } from "./use-focus-mode";
import { useReaderTextSearch } from "./use-reader-text-search";
import { useReaderWordDetailStore } from "./use-reader-word-detail-store";
import { useReaderWordPrefetch } from "./use-reader-word-prefetch";
import { useReaderWordLookup } from "./use-reader-word-lookup";
import { useReaderKeyboard } from "./use-reader-keyboard";
import { useReadingProgress } from "./use-reading-progress";
import { useSentenceTranslationExpansion } from "./use-sentence-translation-expansion";
import { useShowSentenceTranslations } from "./use-show-sentence-translations";

type ReaderWorkspaceProps = {
  text: ReaderTextData;
};

export type { ReaderWorkspaceProps };

function findWordInText(text: ReaderTextData, wordId: string, sentenceId: string) {
  const sentence = text.sentences.find((item) => item.id === sentenceId);
  return sentence?.words.find((word) => word.id === wordId) ?? null;
}

export function ReaderWorkspace({ text }: ReaderWorkspaceProps) {
  const router = useRouter();
  const [selectedSentenceId, setSelectedSentenceId] = useState<string | null>(
    text.sentences[0]?.id ?? null,
  );
  const [selectedWordSnapshot, setSelectedWordSnapshot] = useState<ReaderWordSnapshot | null>(
    null,
  );
  const [hoveredWordSnapshot, setHoveredWordSnapshot] = useState<ReaderWordSnapshot | null>(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [visibleSentenceIds, setVisibleSentenceIds] = useState<string[]>(() =>
    text.sentences[0] ? [text.sentences[0].id] : [],
  );
  const visibleSentenceIdsRef = useRef<Set<string>>(
    new Set(text.sentences[0] ? [text.sentences[0].id] : []),
  );
  const restoredRef = useRef(false);
  const sentenceRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const { showTranslations: showAllTranslations, setShowTranslations: setShowAllTranslations } =
    useShowSentenceTranslations();
  const { isExpanded, toggleExpanded } = useSentenceTranslationExpansion();
  const { focusMode, setFocusMode } = useFocusMode();

  const hasPendingAnalysis = useMemo(
    () =>
      text.sentences.some((sentence) =>
        isSentenceAnalyzing(sentence.analysisState, sentence.words.length),
      ),
    [text.sentences],
  );

  useEffect(() => {
    if (!hasPendingAnalysis) {
      return;
    }

    const timer = window.setInterval(() => {
      router.refresh();
    }, 2500);

    return () => window.clearInterval(timer);
  }, [hasPendingAnalysis, router]);

  const {
    percent,
    totalSentences,
    estimatedMinutes,
    recordSentence,
    recordWord,
    progress,
  } = useReadingProgress(text);

  const interactiveBySentence = useMemo(() => buildInteractiveWordsBySentence(text), [text]);
  const textWords = useMemo(
    () => buildTextWordIndex(text, interactiveBySentence),
    [text, interactiveBySentence],
  );
  const textIndex = useMemo(() => buildReaderTextPhraseIndex(text), [text]);
  const textIntroduction = useMemo(
    () => buildTextIntroduction(text, estimatedMinutes),
    [text, estimatedMinutes],
  );

  const scrollToSearchResult = useCallback((result: ReaderSearchEntry) => {
    setSelectedSentenceId(result.sentenceId);
    requestAnimationFrame(() => {
      document
        .querySelector(`[data-word-id="${result.wordId}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  const textSearch = useReaderTextSearch(text, scrollToSearchResult);

  const searchMatchWordIds = useMemo(
    () => new Set(textSearch.results.map((result) => result.wordId)),
    [textSearch.results],
  );

  const { prefetch, revision } = useReaderWordDetailStore();

  const hoveredWordId = hoveredWordSnapshot?.id ?? null;
  const selectedWordId = selectedWordSnapshot?.id ?? null;

  const { detail, loading } = useReaderWordLookup({
    selectedWord: selectedWordSnapshot,
    cacheRevision: revision,
  });

  useReaderWordPrefetch({
    text,
    visibleSentenceIds,
    selectedWordId,
    hoveredWordId,
    prefetch,
  });

  const buildSnapshot = useCallback(
    (sentenceId: string, wordId: string): ReaderWordSnapshot | null => {
      const sentence = text.sentences.find((item) => item.id === sentenceId);
      const word = findWordInText(text, wordId, sentenceId);
      if (!sentence || !word) {
        return null;
      }
      return toReaderWordSnapshot({
        ...word,
        partOfSpeech: word.partOfSpeech as PartOfSpeech,
        sentenceId,
        textId: text.id,
        literalTranslation: sentence.literalTranslation,
        naturalTranslation: sentence.naturalTranslation,
        gender: word.gender,
        number: word.number,
        tense: word.tense,
        aspect: word.aspect,
      });
    },
    [text],
  );

  const handleHoverWord = useCallback(
    (word: { id: string; sentenceId?: string } & Record<string, unknown>) => {
      const sentenceId = "sentenceId" in word && word.sentenceId ? String(word.sentenceId) : selectedSentenceId;
      if (!sentenceId) {
        return;
      }
      const snapshot = buildSnapshot(sentenceId, word.id);
      if (!snapshot) {
        return;
      }
      setHoveredWordSnapshot(snapshot);
      prefetchWordDetail(word.id);
    },
    [buildSnapshot, selectedSentenceId],
  );

  const handleHoverWordLeave = useCallback(() => {
    setHoveredWordSnapshot(null);
  }, []);

  const agreementTarget = useMemo(() => {
    if (!selectedWordSnapshot) {
      return null;
    }
    const sentence = text.sentences.find((item) => item.id === selectedWordSnapshot.sentenceId);
    if (!sentence || selectedWordSnapshot.partOfSpeech !== "adjective") {
      return null;
    }
    const previous = sentence.words.find(
      (word) => word.position === selectedWordSnapshot.position - 1,
    );
    return previous?.original ?? null;
  }, [selectedWordSnapshot, text.sentences]);

  const timesSeenInText = useMemo(() => {
    if (!selectedWordSnapshot || !progress?.wordsSeenIds.length) {
      return 0;
    }

    const lemma = selectedWordSnapshot.lemma.trim().toLowerCase();
    if (!lemma) {
      return 0;
    }

    const seenLemmaWordIds = new Set<string>();
    for (const sentence of text.sentences) {
      for (const word of sentence.words) {
        if (word.lemma.trim().toLowerCase() === lemma) {
          seenLemmaWordIds.add(word.id);
        }
      }
    }

    return progress.wordsSeenIds.filter((wordId) => seenLemmaWordIds.has(wordId)).length;
  }, [selectedWordSnapshot, progress?.wordsSeenIds, text.sentences]);

  const readingSessionSummary = useMemo(
    () => buildReadingSessionSummary(text, progress?.wordsSeenIds ?? []),
    [text, progress?.wordsSeenIds],
  );

  const marginPanelProps = useMemo(
    () => ({
      detail,
      loading,
      textTitle: text.title,
      textIndex,
      textWords,
      timesSeenInText,
      agreementTarget,
      showAllTranslations,
      onToggleAllTranslations: setShowAllTranslations,
    }),
    [
      detail,
      loading,
      text.title,
      textIndex,
      textWords,
      timesSeenInText,
      agreementTarget,
      showAllTranslations,
      setShowAllTranslations,
    ],
  );

  const selectedSentence = useMemo(
    () => text.sentences.find((sentence) => sentence.id === selectedSentenceId) ?? null,
    [text.sentences, selectedSentenceId],
  );

  useEffect(() => {
    setLastReadTextId(text.id);
  }, [text.id]);

  useEffect(() => {
    if (restoredRef.current) {
      return;
    }
    restoredRef.current = true;
    const saved = getTextReadingProgress(text.id);
    if (!saved?.lastSentenceId) {
      return;
    }
    const sentenceExists = text.sentences.some((sentence) => sentence.id === saved.lastSentenceId);
    if (!sentenceExists) {
      return;
    }
    setSelectedSentenceId(saved.lastSentenceId);
    if (saved.lastWordId) {
      requestAnimationFrame(() => {
        document
          .querySelector(`[data-word-id="${saved.lastWordId}"]`)
          ?.scrollIntoView({ behavior: "auto", block: "center" });
      });
    }
  }, [text.id, text.sentences]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        let topMostIndex = -1;
        let topMostRatio = 0;

        for (const entry of entries) {
          const sentenceId = entry.target.getAttribute("data-sentence-id");
          if (!sentenceId) {
            continue;
          }

          if (entry.isIntersecting) {
            if (!visibleSentenceIdsRef.current.has(sentenceId)) {
              visibleSentenceIdsRef.current.add(sentenceId);
              changed = true;
            }
            recordSentence(sentenceId);

            const index = text.sentences.findIndex((sentence) => sentence.id === sentenceId);
            if (index >= 0 && entry.intersectionRatio >= topMostRatio) {
              topMostRatio = entry.intersectionRatio;
              topMostIndex = index;
            }
          } else if (visibleSentenceIdsRef.current.has(sentenceId)) {
            visibleSentenceIdsRef.current.delete(sentenceId);
            changed = true;
          }
        }

        if (topMostRatio > 0) {
          setCurrentSentenceIndex(topMostIndex);
        }

        if (changed) {
          setVisibleSentenceIds([...visibleSentenceIdsRef.current]);
        }
      },
      { threshold: [0.2, 0.5, 0.75], rootMargin: "120px 0px" },
    );

    for (const node of sentenceRefs.current.values()) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, [text.sentences, recordSentence]);

  const handleSelectSentence = useCallback(
    (sentenceId: string) => {
      setSelectedSentenceId(sentenceId);
      setSelectedWordSnapshot(null);
      setHoveredWordSnapshot(null);
      recordSentence(sentenceId);
    },
    [recordSentence],
  );

  const handleSelectWord = useCallback(
    (sentenceId: string, word: Parameters<typeof toReaderWordSnapshot>[0]) => {
      const sentence = text.sentences.find((item) => item.id === sentenceId);
      if (!sentence) {
        return;
      }
      setSelectedSentenceId(sentenceId);
      setSelectedWordSnapshot(
        toReaderWordSnapshot({
          ...word,
          sentenceId,
          textId: text.id,
          literalTranslation: sentence.literalTranslation,
          naturalTranslation: sentence.naturalTranslation,
        }),
      );
      setHoveredWordSnapshot(null);
      prefetchWordDetail(word.id);
      recordWord(word.id, sentenceId);
    },
    [text.id, text.sentences, recordWord],
  );

  useReaderKeyboard({
    enabled: true,
    words: selectedSentence?.words ?? [],
    sentences: text.sentences.map((sentence) => ({ id: sentence.id })),
    selectedWordId,
    selectedSentenceId,
    onSelectWord: (wordId) => {
      if (!selectedSentenceId) {
        return;
      }
      const sentence = text.sentences.find((item) => item.id === selectedSentenceId);
      const word = sentence?.words.find((item) => item.id === wordId);
      if (word && sentence) {
        handleSelectWord(sentence.id, {
          ...word,
          partOfSpeech: word.partOfSpeech as PartOfSpeech,
          formId: word.formId,
          sentenceId: sentence.id,
          textId: text.id,
          literalTranslation: sentence.literalTranslation,
          naturalTranslation: sentence.naturalTranslation,
        });
      }
    },
    onSelectSentence: handleSelectSentence,
    onClearWord: () => {
      setSelectedWordSnapshot(null);
      setHoveredWordSnapshot(null);
    },
    onOpenSearch: textSearch.focusSearch,
    searchOpen: textSearch.isOpen,
    onCloseSearch: textSearch.closeSearch,
  });

  return (
    <div className="reader-fullscreen min-w-0">
      <ReaderHeader
        title={text.title}
        collectionName={getCollectionName(text.collectionId)}
        level={text.level}
        estimatedMinutes={estimatedMinutes}
        sentenceCount={totalSentences}
        currentSentenceIndex={currentSentenceIndex}
        percent={percent}
        focusMode={focusMode}
        onFocusModeChange={setFocusMode}
      />

      {textSearch.isOpen || textSearch.query.trim().length > 0 ? (
        <div className="mt-5 max-w-[70ch]">
          <ReaderInTextSearch
            query={textSearch.query}
            onQueryChange={textSearch.setQuery}
            resultCount={textSearch.results.length}
            activeIndex={textSearch.activeIndex}
            isOpen={textSearch.isOpen}
            inputRef={textSearch.inputRef}
            onClose={textSearch.closeSearch}
            onNext={textSearch.goToNext}
            onPrevious={textSearch.goToPrevious}
          />
        </div>
      ) : null}

      <div className="mt-6 min-w-0">
        <article className="min-w-0 max-w-[70ch] space-y-8">
            {text.sentences.map((sentence) => {
              const dimmed = focusMode && selectedSentenceId !== sentence.id;
              const analyzing = isSentenceAnalyzing(
                sentence.analysisState,
                sentence.words.length,
              );

              if (analyzing) {
                return (
                  <div
                    key={sentence.id}
                    ref={(node) => {
                      if (node) {
                        sentenceRefs.current.set(sentence.id, node);
                      } else {
                        sentenceRefs.current.delete(sentence.id);
                      }
                    }}
                    data-sentence-id={sentence.id}
                    className={dimmed ? "opacity-35 transition-opacity duration-150" : undefined}
                  >
                    <ReaderSentenceAnalyzing
                      russianText={sentence.russianText}
                      naturalTranslation={sentence.naturalTranslation}
                      showTranslation={isExpanded(sentence.id, showAllTranslations)}
                      onToggleTranslation={() => toggleExpanded(sentence.id)}
                    />
                  </div>
                );
              }

              return (
                <ReaderSentence
                  key={sentence.id}
                  sentenceId={sentence.id}
                  russianText={sentence.russianText}
                  naturalTranslation={sentence.naturalTranslation}
                  words={mapSentenceWords(sentence.words)}
                  interactiveWordKinds={
                    interactiveBySentence.get(sentence.id) ?? new Map()
                  }
                  selectedWordId={selectedWordId}
                  hoveredWordId={hoveredWordId}
                  searchMatchWordIds={searchMatchWordIds}
                  searchActiveWordId={textSearch.activeResult?.wordId ?? null}
                  showTranslation={isExpanded(sentence.id, showAllTranslations)}
                  onToggleTranslation={() => toggleExpanded(sentence.id)}
                  dimmed={dimmed}
                  onSelectSentence={() => handleSelectSentence(sentence.id)}
                  onSelectWord={(word) =>
                    handleSelectWord(sentence.id, {
                      ...word,
                      sentenceId: sentence.id,
                      textId: text.id,
                      literalTranslation: sentence.literalTranslation,
                      naturalTranslation: sentence.naturalTranslation,
                    })
                  }
                  onHoverWord={(word) =>
                    handleHoverWord({ ...word, sentenceId: sentence.id })
                  }
                  onHoverWordLeave={handleHoverWordLeave}
                  registerRef={(node) => {
                    if (node) {
                      sentenceRefs.current.set(sentence.id, node);
                    } else {
                      sentenceRefs.current.delete(sentence.id);
                    }
                  }}
                />
              );
            })}

            <ReaderCompletionCard
              textTitle={text.title}
              discoveries={readingSessionSummary.discoveries}
              continueActions={readingSessionSummary.continueActions}
            />

            {textIntroduction ? (
              <ReaderAboutText introduction={textIntroduction} defaultCollapsed />
            ) : null}
          </article>
      </div>

      <ReaderWordFloatingSheet
        open={selectedWordSnapshot !== null}
        onClose={() => {
          setSelectedWordSnapshot(null);
          setHoveredWordSnapshot(null);
        }}
      >
        <ReaderMarginPanel {...marginPanelProps} />
      </ReaderWordFloatingSheet>
    </div>
  );
}
