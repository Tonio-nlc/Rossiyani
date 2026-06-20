"use client";

import { useSearchParams } from "next/navigation";

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

  if (section === "lessons") {
    return (
      <div className="library-catalog space-y-4 pb-6">
        <LibraryPageIntro />
        <LibrarySectionNav active="lessons" />
        <div className="editorial-page-section space-y-3">
          <h2 className="editorial-section-title">Context translation</h2>
          <LibraryContextTranslationLessons />
        </div>
        <p className="text-metadata">
          <Reference href="/manual">Leçons de grammaire →</Reference>
        </p>
      </div>
    );
  }

  if (section === "saved") {
    return (
      <div className="library-catalog space-y-4 pb-6">
        <LibraryPageIntro />
        <LibrarySectionNav active="saved" />
        <LibrarySavedSentences />
      </div>
    );
  }

  if (section === "discoveries") {
    return (
      <div className="library-catalog space-y-4 pb-6">
        <LibraryPageIntro />
        <LibrarySectionNav active="discoveries" />
        <LibraryMyDiscoveries />
      </div>
    );
  }

  if (section === "phrases") {
    return (
      <div className="library-catalog space-y-4 pb-6">
        <LibraryPageIntro />
        <LibrarySectionNav active="phrases" />
        <LibrarySavedPhrases />
        <LibraryMyPhrases />
      </div>
    );
  }

  return (
    <div className="library-catalog">
      <LibraryPageIntro />
      <LibrarySectionNav active="texts" />
      <LibraryView initialTexts={initialTexts} />
      <LibraryImportCard />
    </div>
  );
}
