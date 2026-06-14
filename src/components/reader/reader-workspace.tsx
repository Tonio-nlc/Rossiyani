"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { TodaysDiscovery } from "@/features/discovery";
import type { ReaderTextData } from "@/features/texts";
import { setLastReadTextId } from "@/lib/last-read-text";
import type { ReaderSearchEntry } from "@/lib/reader/build-reader-search-index";
import { buildTextIntroduction } from "@/lib/reader/build-text-introduction";
import type { ReaderWordSnapshot } from "@/lib/reader/build-minimal-word-detail";
import { getTextReadingProgress } from "@/lib/reader/reading-progress";
import type { PartOfSpeech } from "@/types";

import { SentenceBlock } from "@/components/sentence/sentence-block";

import { ReaderAboutText } from "./reader-about-text";
import { ReaderCompletionCard } from "./reader-completion-card";
import { ReaderHeader } from "./reader-header";
import { ReaderInTextSearch } from "./reader-in-text-search";
import { ReaderMarginPanel } from "./reader-margin-panel";
import { ReaderReadingStatus } from "./reader-reading-status";
import { buildReaderTargets, ReaderTodaysTarget } from "./reader-todays-target";
import { SentenceActions } from "./sentence-actions";
import { toReaderWordSnapshot } from "./reader-word-utils";
import { useFocusMode } from "./use-focus-mode";
import { useReaderTextSearch } from "./use-reader-text-search";
import { useReaderWordAnalysis } from "./use-reader-word-analysis";
import { useReaderKeyboard } from "./use-reader-keyboard";
import { useReadingProgress } from "./use-reading-progress";
import { useSentenceTranslationExpansion } from "./use-sentence-translation-expansion";
import { useShowSentenceTranslations } from "./use-show-sentence-translations";

type ReaderWorkspaceProps = {
  text: ReaderTextData;
  todaysDiscovery?: TodaysDiscovery | null;
};

export type { ReaderWorkspaceProps };

export function ReaderWorkspace({ text, todaysDiscovery = null }: ReaderWorkspaceProps) {
  const [selectedSentenceId, setSelectedSentenceId] = useState<string | null>(
    text.sentences[0]?.id ?? null,
  );
  const [selectedWordSnapshot, setSelectedWordSnapshot] = useState<ReaderWordSnapshot | null>(
    null,
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
    sentencePercent,
    wordsSeenCount,
    totalWords,
    totalSentences,
    estimatedMinutes,
    recordSentence,
    recordWord,
  } = useReadingProgress(text);

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

  const { detail, loading } = useReaderWordAnalysis(selectedWordSnapshot);

  const marginPanelProps = {
    detail,
    loading,
    showAllTranslations,
    onToggleAllTranslations: setShowAllTranslations,
  };

  const todaysTargets = useMemo(
    () => buildReaderTargets(text, todaysDiscovery),
    [text, todaysDiscovery],
  );

  const textIntroduction = useMemo(
    () => buildTextIntroduction(text, estimatedMinutes),
    [text, estimatedMinutes],
  );

  const structureCount = useMemo(() => {
    const labels = new Set<string>();
    for (const sentence of text.sentences) {
      for (const group of sentence.phraseGroups) {
        labels.add(group.label);
      }
    }
    return labels.size;
  }, [text.sentences]);

  const grammarPointCount = useMemo(() => {
    const cases = new Set<string>();
    for (const sentence of text.sentences) {
      for (const word of sentence.words) {
        if (word.case) {
          cases.add(word.case);
        }
      }
    }
    return cases.size;
  }, [text.sentences]);

  const practiceStructure = useMemo(() => {
    const firstPhrase = text.sentences[0]?.phraseGroups[0]?.label;
    return firstPhrase ?? text.sentences[0]?.words[0]?.lemma ?? text.title;
  }, [text]);

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
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const sentenceId = entry.target.getAttribute("data-sentence-id");
            if (sentenceId) {
              recordSentence(sentenceId);
            }
          }
        }
      },
      { threshold: 0.55 },
    );

    for (const node of sentenceRefs.current.values()) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, [text.sentences, recordSentence]);

  const fullAnalysisWordIdsBySentence = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const sentence of text.sentences) {
      const set = new Set<string>();
      for (const word of sentence.words) {
        if (word.formId) {
          set.add(word.id);
        }
      }
      map.set(sentence.id, set);
    }
    return map;
  }, [text.sentences]);

  const selectedSentence = useMemo(
    () => text.sentences.find((sentence) => sentence.id === selectedSentenceId) ?? null,
    [text.sentences, selectedSentenceId],
  );

  const selectedWordId = selectedWordSnapshot?.id ?? null;

  const currentPhraseIndex = useMemo(() => {
    if (!selectedSentenceId) {
      return 1;
    }
    const index = text.sentences.findIndex((sentence) => sentence.id === selectedSentenceId);
    return index >= 0 ? index + 1 : 1;
  }, [selectedSentenceId, text.sentences]);

  const handleSelectSentence = useCallback(
    (sentenceId: string) => {
      setSelectedSentenceId(sentenceId);
      setSelectedWordSnapshot(null);
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
    onClearWord: () => setSelectedWordSnapshot(null),
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
        wordCount={totalWords}
        percent={percent}
        focusMode={focusMode}
        onFocusModeChange={setFocusMode}
      />

      <div className="mt-4">
        <ReaderAboutText introduction={textIntroduction} />
      </div>

      {textSearch.isOpen || textSearch.query.trim().length > 0 ? (
        <div className="mt-5 max-w-[var(--reading-max)]">
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

      <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(240px,var(--annotation-max))] lg:items-start lg:gap-8">
        <div className="min-w-0 space-y-5">
          <ReaderReadingStatus
            currentPhraseIndex={currentPhraseIndex}
            totalPhrases={totalSentences}
            sentencePercent={sentencePercent}
            wordPercent={percent}
          />

          <ReaderTodaysTarget
            targets={todaysTargets}
            discovery={todaysDiscovery}
            estimatedMinutes={estimatedMinutes}
          />

          <article className="min-w-0 space-y-6">
            {text.sentences.map((sentence) => {
              const isActive = selectedSentenceId === sentence.id;
              const dimmed = focusMode && !isActive;

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
                  onClick={(event) => {
                    const target = event.target as HTMLElement;
                    if (target.closest("button, a")) {
                      return;
                    }
                    handleSelectSentence(sentence.id);
                  }}
                  className={[
                    "min-w-0 rounded-2xl border-l-2 py-1 pl-4 transition duration-200",
                    isActive
                      ? "border-[var(--ink)] bg-[var(--surface)]/40"
                      : "border-transparent",
                    dimmed ? "opacity-40" : "opacity-100",
                    focusMode && isActive ? "opacity-100" : "",
                  ].join(" ")}
                >
                  <SentenceBlock
                    sentenceId={sentence.id}
                    russianText={sentence.russianText}
                    naturalTranslation={sentence.naturalTranslation}
                    showTranslation={isExpanded(sentence.id, showAllTranslations)}
                    onToggleTranslation={() => toggleExpanded(sentence.id)}
                    words={sentence.words.map((word) => ({
                      ...word,
                      partOfSpeech: word.partOfSpeech as PartOfSpeech,
                      formId: word.formId,
                    }))}
                    fullAnalysisWordIds={
                      fullAnalysisWordIdsBySentence.get(sentence.id) ?? new Set()
                    }
                    selectedWordId={selectedWordId}
                    searchMatchWordIds={searchMatchWordIds}
                    searchActiveWordId={textSearch.activeResult?.wordId ?? null}
                    onSelectWord={(word) =>
                      handleSelectWord(sentence.id, {
                        ...word,
                        sentenceId: sentence.id,
                        textId: text.id,
                        literalTranslation: sentence.literalTranslation,
                        naturalTranslation: sentence.naturalTranslation,
                      })
                    }
                  />
                  <SentenceActions
                    sentenceRussian={sentence.russianText}
                    textId={text.id}
                    textTitle={text.title}
                    selected={isActive}
                  />
                  {selectedWordSnapshot?.sentenceId === sentence.id ? (
                    <div
                      ref={marginRef}
                      className="mt-5 border-t border-[var(--hairline)] pt-5 lg:hidden"
                      aria-label="Annotations"
                    >
                      <ReaderMarginPanel {...marginPanelProps} />
                    </div>
                  ) : null}
                </div>
              );
            })}

            <ReaderCompletionCard
              wordsReviewed={wordsSeenCount}
              structureCount={structureCount}
              grammarPointCount={grammarPointCount}
              practiceStructure={practiceStructure}
              primaryConceptKey={null}
            />
          </article>
        </div>

        <aside
          className="hidden min-w-0 lg:sticky lg:block lg:top-[calc(var(--header-height)+1rem)] lg:self-start"
          aria-label="Annotations"
        >
          <ReaderMarginPanel {...marginPanelProps} />
        </aside>
      </div>
    </div>
  );
}
