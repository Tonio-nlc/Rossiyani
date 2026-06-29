"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAudioPlayback } from "@/components/audio/audio-playback-provider";
import { getCollectionName } from "@/content/collections";
import type { ReaderTextData } from "@/features/texts";
import { isLearnableLemma } from "@/lib/linguistics/lexical-metadata";
import { setLastReadTextId } from "@/lib/last-read-text";
import type { ReaderSearchEntry } from "@/lib/reader/build-reader-search-index";
import { buildInteractiveWordsBySentence } from "@/lib/reader/build-interactive-words";
import { buildPatternBearerWordIds } from "@/lib/reader/build-pattern-bearer-words";
import { buildReaderWordGuide } from "@/lib/reader/build-reader-word-guide";
import { buildTextIntroduction } from "@/lib/reader/build-text-introduction";
import { buildReaderTextPhraseIndex } from "@/lib/reader/build-reader-word-panel-data";
import { buildReadingSessionSummary } from "@/lib/reader/build-reading-session-summary";
import type { ReaderWordSnapshot } from "@/lib/reader/build-minimal-word-detail";
import { getTextReadingProgress, isTextReadingComplete } from "@/lib/reader/reading-progress";
import { markFirstSessionTextCompleted } from "@/lib/reader/first-session";
import {
  resolveTranslationVisible,
  shouldShowTranslationToggle,
} from "@/lib/reader/translation-display-preference";
import type { PartOfSpeech } from "@/types";
import { prefetchWordDetail } from "@/lib/reader/reader-word-detail-store";

import { ReaderAboutText } from "./reader-about-text";
import { ReaderAudioPlayer } from "./reader-audio-player";
import { ReaderCompletionCard } from "./reader-completion-card";
import { ReaderWordPanel } from "./reader-word-panel";
import { ReaderHeader } from "./reader-header";
import { ReaderInTextSearch } from "./reader-in-text-search";
import { ReaderShell } from "./reader-shell";
import { mapSentenceWords, ReaderSentence } from "./reader-sentence";
import { isSentenceAnalyzing, ReaderSentenceAnalyzing } from "./reader-sentence-analyzing";
import { toReaderWordSnapshot } from "./reader-word-utils";
import { useReaderTextSearch } from "./use-reader-text-search";
import { useReaderWordDetailStore } from "./use-reader-word-detail-store";
import { useReaderWordPrefetch } from "./use-reader-word-prefetch";
import { useReaderWordLookup } from "./use-reader-word-lookup";
import { useReaderKeyboard } from "./use-reader-keyboard";
import { useReadingProgress } from "./use-reading-progress";
import { useSentenceTranslationExpansion } from "./use-sentence-translation-expansion";
import { useReaderPatternExperience } from "./use-reader-pattern-experience";
import { useTranslationDisplay } from "./use-translation-display";

type ReaderWorkspaceProps = {
  text: ReaderTextData;
};

export type { ReaderWorkspaceProps };

const BOOKMARK_KEY = "rossiyani:readerBookmarks";
const FONT_SCALE_KEY = "rossiyani:readerFontScale";

function findWordInText(text: ReaderTextData, wordId: string, sentenceId: string) {
  const sentence = text.sentences.find((item) => item.id === sentenceId);
  return sentence?.words.find((word) => word.id === wordId) ?? null;
}

function loadBookmarks(): Set<string> {
  if (typeof localStorage === "undefined") {
    return new Set();
  }
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveBookmarks(ids: Set<string>): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify([...ids]));
}

function loadFontScale(): number {
  if (typeof localStorage === "undefined") {
    return 1;
  }
  const raw = localStorage.getItem(FONT_SCALE_KEY);
  const value = raw ? Number(raw) : 1;
  return [1, 1.125, 1.25].includes(value) ? value : 1;
}

export function ReaderWorkspace({ text }: ReaderWorkspaceProps) {
  const router = useRouter();
  const [selectedSentenceId, setSelectedSentenceId] = useState<string | null>(
    text.sentences[0]?.id ?? null,
  );
  const [selectedWordSnapshot, setSelectedWordSnapshot] = useState<ReaderWordSnapshot | null>(null);
  const [hoveredWordSnapshot, setHoveredWordSnapshot] = useState<ReaderWordSnapshot | null>(null);
  const [visibleSentenceIds, setVisibleSentenceIds] = useState<string[]>(() =>
    text.sentences[0] ? [text.sentences[0].id] : [],
  );
  const [wordPanelOpen, setWordPanelOpen] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [bookmarked, setBookmarked] = useState(false);
  const visibleSentenceIdsRef = useRef<Set<string>>(
    new Set(text.sentences[0] ? [text.sentences[0].id] : []),
  );
  const restoredRef = useRef(false);
  const sentenceRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const { mode: translationMode, setMode: setTranslationMode, interlinear, setInterlinear } =
    useTranslationDisplay();
  const { isExpanded, toggleExpanded, expandedIds } = useSentenceTranslationExpansion();

  const { activeSentenceId: playingSentenceId } = useAudioPlayback();

  const sentenceIds = useMemo(() => text.sentences.map((sentence) => sentence.id), [text.sentences]);

  const showTranslationToggle = shouldShowTranslationToggle(translationMode);

  const {
    recordSentenceExposure,
    buildWordExperience,
    patternEchoBySentence,
  } = useReaderPatternExperience(text);

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
    const timer = window.setInterval(() => router.refresh(), 2500);
    return () => window.clearInterval(timer);
  }, [hasPendingAnalysis, router]);

  useEffect(() => {
    setFontScale(loadFontScale());
    setBookmarked(loadBookmarks().has(text.id));
  }, [text.id]);

  const {
    percent,
    totalSentences,
    estimatedMinutes,
    recordSentence,
    recordWord,
    progress,
  } = useReadingProgress(text);

  const isReadingComplete = useMemo(
    () => isTextReadingComplete(progress, totalSentences),
    [progress, totalSentences],
  );

  useEffect(() => {
    if (isReadingComplete) {
      markFirstSessionTextCompleted(text.id);
    }
  }, [isReadingComplete, text.id]);

  const interactiveBySentence = useMemo(() => buildInteractiveWordsBySentence(text), [text]);
  const patternBearerBySentence = useMemo(() => buildPatternBearerWordIds(text), [text]);
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
      const sentenceId =
        "sentenceId" in word && word.sentenceId ? String(word.sentenceId) : selectedSentenceId;
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

  const readingSessionSummary = useMemo(
    () => buildReadingSessionSummary(text, progress?.wordsSeenIds ?? []),
    [text, progress?.wordsSeenIds],
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
    if (!playingSentenceId) {
      return;
    }
    sentenceRefs.current.get(playingSentenceId)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [playingSentenceId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;

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
            recordSentenceExposure(sentenceId);
          } else if (visibleSentenceIdsRef.current.has(sentenceId)) {
            visibleSentenceIdsRef.current.delete(sentenceId);
            changed = true;
          }
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
  }, [text.sentences, recordSentence, recordSentenceExposure]);

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
      setWordPanelOpen(true);
      prefetchWordDetail(word.id);
      recordWord(
        word.id,
        sentenceId,
        isLearnableLemma({ isProperNoun: word.isProperNoun }),
      );
    },
    [text.id, text.sentences, recordWord],
  );

  useReaderKeyboard({
    enabled: true,
    words: text.sentences.find((s) => s.id === selectedSentenceId)?.words ?? [],
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

  const handleFontScaleChange = useCallback((scale: number) => {
    setFontScale(scale);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(FONT_SCALE_KEY, String(scale));
    }
  }, []);

  const handleBookmarkToggle = useCallback(() => {
    const bookmarks = loadBookmarks();
    if (bookmarks.has(text.id)) {
      bookmarks.delete(text.id);
      setBookmarked(false);
    } else {
      bookmarks.add(text.id);
      setBookmarked(true);
    }
    saveBookmarks(bookmarks);
  }, [text.id]);

  const patternExperience = useMemo(() => {
    if (!selectedWordSnapshot) {
      return null;
    }
    return buildWordExperience(selectedWordSnapshot.sentenceId, selectedWordSnapshot.position);
  }, [buildWordExperience, selectedWordSnapshot]);

  const guideLinkedWordIds = useMemo(() => {
    if (!selectedWordSnapshot) {
      return new Set<string>();
    }
    const bearerIds = patternBearerBySentence.get(selectedWordSnapshot.sentenceId);
    const isBearer = bearerIds?.has(selectedWordSnapshot.id) ?? false;
    const guide = buildReaderWordGuide({
      text,
      snapshot: selectedWordSnapshot,
      patternExperience,
      isPatternBearer: isBearer,
    });
    return new Set(guide.linkedWordIds);
  }, [text, selectedWordSnapshot, patternExperience, patternBearerBySentence]);

  const closeWordPanel = useCallback(() => {
    setWordPanelOpen(false);
    setSelectedWordSnapshot(null);
  }, []);

  return (
    <ReaderShell
      wordPanelOpen={wordPanelOpen || selectedWordSnapshot !== null}
      onToggleWordPanel={() => setWordPanelOpen((value) => !value)}
      footer={
        <ReaderAudioPlayer
          sentenceIds={sentenceIds}
          startSentenceId={selectedSentenceId}
          onSentenceSeek={handleSelectSentence}
        />
      }
      wordPanel={
        <ReaderWordPanel
          text={text}
          patternBearerBySentence={patternBearerBySentence}
          detail={detail}
          loading={loading}
          snapshot={selectedWordSnapshot}
          textIndex={textIndex}
          patternExperience={patternExperience}
          onClose={closeWordPanel}
        />
      }
    >
      {wordPanelOpen && selectedWordSnapshot ? (
        <button
          type="button"
          className="reader-ws__explorer-backdrop"
          aria-label="Fermer le panneau mot"
          onClick={closeWordPanel}
        />
      ) : null}

      <div
        className="reader-ws__content"
        style={{ ["--rw-font-scale" as string]: String(fontScale) }}
      >
        <ReaderHeader
          collectionName={getCollectionName(text.collectionId)}
          title={text.title}
          level={text.level}
          estimatedMinutes={estimatedMinutes}
          percent={percent}
          fontScale={fontScale}
          bookmarked={bookmarked}
          translationMode={translationMode}
          interlinear={interlinear}
          onFontScaleChange={handleFontScaleChange}
          onBookmarkToggle={handleBookmarkToggle}
          onOpenSearch={textSearch.focusSearch}
          onTranslationModeChange={setTranslationMode}
          onInterlinearChange={setInterlinear}
        />

        {textSearch.isOpen || textSearch.query.trim().length > 0 ? (
          <div className="reader-ws-search">
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

        <div className="reader-ws__article-wrap">
          <article className="reader-ws-article">
            {text.sentences.map((sentence) => {
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
                    className={[
                      "reader-ws-sentence-wrap--current",
                      playingSentenceId === sentence.id ? "reader-ws-sentence-wrap--playing" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <ReaderSentenceAnalyzing
                      russianText={sentence.russianText}
                      literalTranslation={sentence.literalTranslation}
                      naturalTranslation={sentence.naturalTranslation}
                      showTranslation={resolveTranslationVisible(sentence.id, translationMode, expandedIds)}
                      showTranslationToggle={showTranslationToggle}
                      showInterlinear={interlinear}
                      onToggleTranslation={() => toggleExpanded(sentence.id)}
                    />
                  </div>
                );
              }

              return (
                <ReaderSentence
                  key={sentence.id}
                  sentenceId={sentence.id}
                  isPlaying={playingSentenceId === sentence.id}
                  russianText={sentence.russianText}
                  literalTranslation={sentence.literalTranslation}
                  naturalTranslation={sentence.naturalTranslation}
                  words={mapSentenceWords(sentence.words)}
                  interactiveWordKinds={interactiveBySentence.get(sentence.id) ?? new Map()}
                  patternBearerWordIds={patternBearerBySentence.get(sentence.id)}
                  guideLinkedWordIds={
                    selectedWordSnapshot?.sentenceId === sentence.id ? guideLinkedWordIds : undefined
                  }
                  selectedWordId={selectedWordId}
                  hoveredWordId={hoveredWordId}
                  searchMatchWordIds={searchMatchWordIds}
                  searchActiveWordId={textSearch.activeResult?.wordId ?? null}
                  showTranslation={resolveTranslationVisible(sentence.id, translationMode, expandedIds)}
                  showTranslationToggle={showTranslationToggle}
                  showInterlinear={interlinear}
                  onToggleTranslation={() => toggleExpanded(sentence.id)}
                  showPatternEcho={patternEchoBySentence.get(sentence.id) ?? false}
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
                  onHoverWord={(word) => handleHoverWord({ ...word, sentenceId: sentence.id })}
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
          </article>

          {isReadingComplete ? (
            <ReaderCompletionCard
              textTitle={text.title}
              continueActions={readingSessionSummary.continueActions}
            />
          ) : null}
          {textIntroduction ? (
            <ReaderAboutText introduction={textIntroduction} defaultCollapsed />
          ) : null}
        </div>
      </div>
    </ReaderShell>
  );
}
