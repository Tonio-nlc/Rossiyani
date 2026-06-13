"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EditorialTitle, Hairline, MetadataLine } from "@/components/editorial";
import { SentenceBlock } from "@/components/sentence/sentence-block";
import { SentenceActions } from "./sentence-actions";
import type { ReaderTextData } from "@/features/texts";
import { setLastReadTextId } from "@/lib/last-read-text";
import type { ReaderSearchEntry } from "@/lib/reader/build-reader-search-index";
import { getTextReadingProgress } from "@/lib/reader/reading-progress";
import type { ReaderWordSnapshot } from "@/lib/reader/build-minimal-word-detail";
import type { PartOfSpeech } from "@/types";

import { ReaderInTextSearch } from "./reader-in-text-search";
import { ReaderMarginPanel } from "./reader-margin-panel";
import { toReaderWordSnapshot } from "./reader-word-utils";
import { useReaderTextSearch } from "./use-reader-text-search";
import { useReaderWordAnalysis } from "./use-reader-word-analysis";
import { useReaderKeyboard } from "./use-reader-keyboard";
import { useReadingProgress } from "./use-reading-progress";
import { useShowSentenceTranslations } from "./use-show-sentence-translations";

type ReaderWorkspaceProps = {
  text: ReaderTextData;
};

export function ReaderWorkspace({ text }: ReaderWorkspaceProps) {
  const [selectedSentenceId, setSelectedSentenceId] = useState<string | null>(
    text.sentences[0]?.id ?? null,
  );
  const [selectedWordSnapshot, setSelectedWordSnapshot] = useState<ReaderWordSnapshot | null>(
    null,
  );
  const marginRef = useRef<HTMLDivElement>(null);
  const restoredRef = useRef(false);

  const { showTranslations, setShowTranslations } = useShowSentenceTranslations();

  const { percent, wordsSeenCount, totalWords, recordSentence, recordWord } =
    useReadingProgress(text);

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
    showTranslations,
    onToggleTranslations: setShowTranslations,
  };

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

  const metadataItems = [
    text.level,
    text.source ?? undefined,
    `${text.sentences.length} phrases`,
    totalWords > 0 ? `${percent}% lu` : undefined,
    totalWords > 0 ? `${wordsSeenCount}/${totalWords} mots` : undefined,
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="reader-fullscreen min-w-0">
      <header className="max-w-[var(--reading-max)]">
        <EditorialTitle variant="section">{text.title}</EditorialTitle>
        <MetadataLine className="mt-3" items={metadataItems} />
      </header>

      {textSearch.isOpen || textSearch.query.trim().length > 0 ? (
        <div className="mt-[var(--layout-gap)] max-w-[var(--reading-max)]">
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

      <Hairline className="my-[var(--layout-gap)]" />

      <div className="grid min-w-0 gap-[var(--layout-gap)] lg:grid-cols-[minmax(0,1fr)_minmax(240px,var(--annotation-max))] lg:items-start lg:gap-[clamp(1.5rem,3vw,2.5rem)]">
        <article className="min-w-0 space-y-[var(--layout-gap)]">
          {text.sentences.map((sentence) => (
            <div
              key={sentence.id}
              onClick={(event) => {
                const target = event.target as HTMLElement;
                if (target.closest("button, a")) {
                  return;
                }
                handleSelectSentence(sentence.id);
              }}
              className={[
                "min-w-0 border-l pl-3 transition",
                selectedSentenceId === sentence.id
                  ? "border-[var(--ink-muted)]"
                  : "border-transparent",
              ].join(" ")}
            >
              <SentenceBlock
                sentenceId={sentence.id}
                russianText={sentence.russianText}
                naturalTranslation={sentence.naturalTranslation}
                showTranslation={showTranslations}
                words={sentence.words.map((word) => ({
                  ...word,
                  partOfSpeech: word.partOfSpeech as PartOfSpeech,
                  formId: word.formId,
                }))}
                fullAnalysisWordIds={fullAnalysisWordIdsBySentence.get(sentence.id) ?? new Set()}
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
                selected={selectedSentenceId === sentence.id}
              />
              {selectedWordSnapshot?.sentenceId === sentence.id ? (
                <div
                  ref={marginRef}
                  className="mt-[var(--layout-gap)] border-t border-[var(--hairline)] pt-[var(--layout-gap)] lg:hidden"
                  aria-label="Annotations"
                >
                  <ReaderMarginPanel {...marginPanelProps} />
                </div>
              ) : null}
            </div>
          ))}
        </article>

        <aside
          className="hidden min-w-0 lg:sticky lg:block lg:top-[calc(var(--header-height)+var(--layout-gap))] lg:self-start"
          aria-label="Annotations"
        >
          <ReaderMarginPanel {...marginPanelProps} />
        </aside>
      </div>
    </div>
  );
}
