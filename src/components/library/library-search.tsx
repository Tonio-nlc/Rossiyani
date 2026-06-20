"use client";

import { SearchField } from "@/components/design-system";

type LibrarySearchProps = {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
};

export function LibrarySearch({ value, onChange, resultCount }: LibrarySearchProps) {
  return (
    <div className="library-catalog-search">
      <SearchField
        value={value}
        onChange={onChange}
        resultCount={resultCount}
        placeholder="Rechercher un titre…"
        ariaLabel="Rechercher dans la bibliothèque"
      />
    </div>
  );
}
