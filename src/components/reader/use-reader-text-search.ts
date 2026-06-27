"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  buildReaderSearchIndex,
  searchReaderIndex,
  type ReaderSearchEntry,
} from "@/lib/reader/build-reader-search-index";
import type { ReaderTextData } from "@/features/texts";

const DEBOUNCE_MS = 150;

export type ReaderTextSearchState = {
  query: string;
  setQuery: (value: string) => void;
  results: ReaderSearchEntry[];
  activeIndex: number;
  activeResult: ReaderSearchEntry | null;
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  focusSearch: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

export function useReaderTextSearch(
  text: ReaderTextData,
  onActivateResult: (result: ReaderSearchEntry) => void,
): ReaderTextSearchState {
  const index = useMemo(() => buildReaderSearchIndex(text), [text]);
  const [query, setQueryState] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  const results = useMemo(
    () => searchReaderIndex(index, debouncedQuery),
    [index, debouncedQuery],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery]);

  const activeResult = results[activeIndex] ?? null;

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
    if (value.trim()) {
      setIsOpen(true);
    }
  }, []);

  const openSearch = useCallback(() => {
    setIsOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQueryState("");
    setDebouncedQuery("");
    setActiveIndex(0);
    inputRef.current?.blur();
  }, []);

  const focusSearch = openSearch;

  const goToNext = useCallback(() => {
    if (results.length === 0) {
      return;
    }
    const next = (activeIndex + 1) % results.length;
    setActiveIndex(next);
    onActivateResult(results[next]!);
  }, [activeIndex, onActivateResult, results]);

  const goToPrevious = useCallback(() => {
    if (results.length === 0) {
      return;
    }
    const next = (activeIndex - 1 + results.length) % results.length;
    setActiveIndex(next);
    onActivateResult(results[next]!);
  }, [activeIndex, onActivateResult, results]);

  return {
    query,
    setQuery,
    results,
    activeIndex,
    activeResult,
    isOpen,
    openSearch,
    closeSearch,
    focusSearch,
    goToNext,
    goToPrevious,
    inputRef,
  };
}
