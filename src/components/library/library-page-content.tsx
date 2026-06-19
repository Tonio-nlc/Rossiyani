"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { Reference } from "@/components/editorial";

import { LibraryContextTranslationLessons } from "./library-context-translation-lessons";
import { LibraryImportCard } from "./library-import-card";
import { LibraryMyDiscoveries } from "./library-my-discoveries";
import { LibraryMyPhrases } from "./library-my-phrases";
import { LibraryPageIntro } from "./library-page-intro";
import { LibrarySavedPhrases } from "./library-saved-phrases";
import { LibrarySavedSentences } from "./library-saved-sentences";
import { LibrarySectionNav, type LibrarySection } from "./library-section-nav";
import { LibraryView } from "./library-view";
import type { TextListItem } from "@/features/texts";

type LibraryPageContentProps = {
  initialTexts: TextListItem[];
};

function parseSection(value: string | null): LibrarySection {
  if (value === "saved" || value === "phrases" || value === "lessons" || value === "discoveries") {
    return value;
  }
  return "texts";
}

export function LibraryPageContent({ initialTexts }: LibraryPageContentProps) {
  const searchParams = useSearchParams();
  const section = parseSection(searchParams.get("section"));

  const collectionStats = useMemo(() => {
    const sentenceCount = initialTexts.reduce((sum, text) => sum + text.sentenceCount, 0);
    return { textCount: initialTexts.length, sentenceCount };
  }, [initialTexts]);

  if (section === "lessons") {
    return (
      <div className="space-y-8 pb-8">
        <LibraryPageIntro />
        <LibrarySectionNav active="lessons" />
        <div className="editorial-page-section space-y-3">
          <h2 className="editorial-section-title">Context translation</h2>
          <LibraryContextTranslationLessons />
        </div>
        <p className="text-metadata">
          Grammar lessons live in the Manual.{" "}
          <Reference href="/manual">Open Manual →</Reference>
        </p>
      </div>
    );
  }

  if (section === "saved") {
    return (
      <div className="space-y-6 pb-8">
        <LibraryPageIntro />
        <LibrarySectionNav active="saved" />
        <LibrarySavedSentences />
      </div>
    );
  }

  if (section === "discoveries") {
    return (
      <div className="space-y-6 pb-8">
        <LibraryPageIntro />
        <LibrarySectionNav active="discoveries" />
        <LibraryMyDiscoveries />
      </div>
    );
  }

  if (section === "phrases") {
    return (
      <div className="space-y-6 pb-8">
        <LibraryPageIntro />
        <LibrarySectionNav active="phrases" />
        <LibrarySavedPhrases />
        <LibraryMyPhrases />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <LibraryPageIntro
        textCount={collectionStats.textCount}
        sentenceCount={collectionStats.sentenceCount}
      />
      <LibraryImportCard />
      <LibrarySectionNav active="texts" />
      <LibraryView initialTexts={initialTexts} />
    </div>
  );
}
