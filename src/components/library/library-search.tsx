"use client";

import { SearchField } from "@/components/design-system";

type LibrarySearchProps = {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
};

export function LibrarySearch({ value, onChange, resultCount }: LibrarySearchProps) {
  return (
    <div className="sticky top-[var(--header-height)] z-30 -mx-[var(--layout-padding-inline)] bg-[var(--paper)]/95 px-[var(--layout-padding-inline)] py-3 backdrop-blur-sm">
      <SearchField
        value={value}
        onChange={onChange}
        resultCount={resultCount}
        placeholder="Rechercher par titre, collection ou niveau…"
        ariaLabel="Rechercher dans la bibliothèque"
      />
    </div>
  );
}
