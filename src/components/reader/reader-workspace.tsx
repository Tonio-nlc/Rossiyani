"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ReaderTextData } from "@/features/texts";
import { setLastReadTextId } from "@/lib/last-read-text";
import type { ReaderSearchEntry } from "@/lib/reader/build-reader-search-index";
import {
  buildInteractiveWordsBySentence,
  buildTextWordIndex,
  type InteractiveWordEntry,
} from "@/lib/reader/build-interactive-words";
import { buildTextIntroduction } from "@/lib/reader/build-text-introduction";
import { buildReaderTextPhraseIndex } from "@/lib/reader/build-reader-word-panel-data";
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
  const marginRef = useRef<HTMLDivElement>(null);
  const restoredRef = useRef(false);
  const sentenceRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const { showTranslations: showAllTranslations, setShowTranslations: setShowAllTranslations } =
    useShowSentenceTranslations();
  const { isExpanded, toggleExpanded } = useSentenceTranslationExpansion();
  const { focusMode, setFocusMode } = useFocusMode();

  const {
    percent,
    wordsSeenCount,
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

  const displayWordSnapshot = hoveredWordSnapshot ?? selectedWordSnapshot;
  const hoveredWordId = hoveredWordSnapshot?.id ?? null;
  const selectedWordId = selectedWordSnapshot?.id ?? null;
  const activeWordId = displayWordSnapshot?.id ?? null;

  const { detail, loading } = useReaderWordLookup({
    selectedWord: displayWordSnapshot,
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

  const handleHoverWordEntry = useCallback(
    (entry: InteractiveWordEntry) => {
      const snapshot = buildSnapshot(entry.sentenceId, entry.id);
      if (!snapshot) {
        return;
      }
      setHoveredWordSnapshot(snapshot);
      prefetchWordDetail(entry.id);
    },
    [buildSnapshot],
  );

  const handleHoverWordLeave = useCallback(() => {
    setHoveredWordSnapshot(null);
  }, []);

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

  const agreementTarget = useMemo(() => {
    if (!displayWordSnapshot) {
      return null;
    }
    const sentence = text.sentences.find((item) => item.id === displayWordSnapshot.sentenceId);
    if (!sentence || displayWordSnapshot.partOfSpeech !== "adjective") {
      return null;
    }
    const previous = sentence.words.find(
      (word) => word.position === displayWordSnapshot.position - 1,
    );
    return previous?.original ?? null;
  }, [displayWordSnapshot, text.sentences]);

  const marginPanelProps = useMemo(
    () => ({
      detail,
      loading,
      textIndex,
      textWords,
      activeWordId,
      agreementTarget,
      showAllTranslations,
      onToggleAllTranslations: setShowAllTranslations,
      onHoverWord: handleHoverWordEntry,
      onSelectWord: (entry: InteractiveWordEntry) => {
        const snapshot = buildSnapshot(entry.sentenceId, entry.id);
        if (!snapshot) {
          return;
        }
        setSelectedSentenceId(entry.sentenceId);
        setSelectedWordSnapshot(snapshot);
        setHoveredWordSnapshot(null);
        prefetchWordDetail(entry.id);
        recordWord(entry.id, entry.sentenceId);
      },
      onHoverWordLeave: handleHoverWordLeave,
    }),
    [
      detail,
      loading,
      textIndex,
      textWords,
      activeWordId,
      agreementTarget,
      showAllTranslations,
      setShowAllTranslations,
      handleHoverWordEntry,
      handleHoverWordLeave,
      buildSnapshot,
      recordWord,
    ],
  );

  const constructionCount = useMemo(() => {
    const labels = new Set<string>();
    for (const sentence of text.sentences) {
      for (const group of sentence.phraseGroups) {
        if (
          group.type === "NATIVE_CONSTRUCTION" ||
          group.type === "FIXED_EXPRESSION" ||
          group.type === "COLLOCATION"
        ) {
          labels.add(group.label);
        }
      }
    }
    return labels.size;
  }, [text.sentences]);

  const grammarObservationCount = useMemo(() => {
    const seenIds = new Set(progress?.wordsSeenIds ?? []);
    let count = 0;
    for (const sentence of text.sentences) {
      const interactive = interactiveBySentence.get(sentence.id);
      if (!interactive) {
        continue;
      }
      for (const [wordId, kind] of interactive) {
        if (kind === "grammar" && seenIds.has(wordId)) {
          count += 1;
        }
      }
    }
    return count;
  }, [interactiveBySentence, progress?.wordsSeenIds, text.sentences]);

  const practiceStructure = useMemo(() => {
    const firstPhrase = text.sentences[0]?.phraseGroups[0]?.label;
    return firstPhrase ?? text.sentences[0]?.words[0]?.lemma ?? text.title;
  }, [text]);

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
      if (window.matchMedia("(max-width: 1023px)").matches) {
        requestAnimationFrame(() => {
          marginRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      }
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

      <div className="mt-6 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(240px,3fr)] lg:items-start lg:gap-10">
        <div className="min-w-0">
          <article className="min-w-0 max-w-[70ch] space-y-8">
            {text.sentences.map((sentence) => {
              const dimmed = focusMode && selectedSentenceId !== sentence.id;

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
                  selectedWordSentenceId={selectedWordSnapshot?.sentenceId ?? null}
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
                  marginPanelProps={marginPanelProps}
                  registerRef={(node) => {
                    if (node) {
                      sentenceRefs.current.set(sentence.id, node);
                    } else {
                      sentenceRefs.current.delete(sentence.id);
                    }
                  }}
                  marginRef={marginRef}
                />
              );
            })}

            <ReaderCompletionCard
              newWordsCount={wordsSeenCount}
              constructionCount={constructionCount}
              grammarObservationCount={grammarObservationCount}
              practiceStructure={practiceStructure}
              primaryConceptKey={null}
            />

            {textIntroduction ? (
              <ReaderAboutText introduction={textIntroduction} defaultCollapsed />
            ) : null}
          </article>
        </div>

        <aside
          className="hidden min-w-0 lg:sticky lg:block lg:top-[calc(var(--header-height)+1rem)] lg:self-start"
          aria-label="Word context"
        >
          <ReaderMarginPanel {...marginPanelProps} />
        </aside>
      </div>
    </div>
  );
}
