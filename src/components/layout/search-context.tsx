"use client";

import { createContext, useContext } from "react";

type SearchContextValue = {
  openSearch: () => void;
};

const SearchContext = createContext<SearchContextValue>({
  openSearch: () => {},
});

export function SearchProvider({
  openSearch,
  children,
}: {
  openSearch: () => void;
  children: React.ReactNode;
}) {
  return <SearchContext.Provider value={{ openSearch }}>{children}</SearchContext.Provider>;
}

export function useSearch(): SearchContextValue {
  return useContext(SearchContext);
}
