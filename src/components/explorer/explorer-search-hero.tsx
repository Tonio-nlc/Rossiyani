"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { UniversalSearchPanel } from "./universal-search-panel";

type ExplorerSearchHeroProps = {
  autoFocus?: boolean;
};

function ExplorerSearchHeroInner({ autoFocus = true }: ExplorerSearchHeroProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  return (
    <UniversalSearchPanel
      variant="hero"
      autoFocus={autoFocus}
      initialQuery={initialQuery}
    />
  );
}

export function ExplorerSearchHero(props: ExplorerSearchHeroProps) {
  return (
    <Suspense
      fallback={
        <UniversalSearchPanel variant="hero" autoFocus={false} initialQuery="" />
      }
    >
      <ExplorerSearchHeroInner {...props} />
    </Suspense>
  );
}
