"use client";

import { useSearchParams } from "next/navigation";

import { Reference } from "@/components/editorial";

import { LibraryMyDiscoveries } from "./library-my-discoveries";
import { LibraryMyPhrases } from "./library-my-phrases";
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
      <div className="space-y-6 pb-16">
        <LibrarySectionNav active="lessons" />
        <p className="text-sm text-[var(--ink-muted)]">
          Grammar lessons live in the Manual.{" "}
          <Reference href="/manual">Open Manual →</Reference>
        </p>
      </div>
    );
  }

  if (section === "saved") {
    return (
      <div className="space-y-6 pb-16">
        <LibrarySectionNav active="saved" />
        <LibrarySavedSentences />
      </div>
    );
  }

  if (section === "discoveries") {
    return (
      <div className="space-y-6 pb-16">
        <LibrarySectionNav active="discoveries" />
        <LibraryMyDiscoveries />
      </div>
    );
  }

  if (section === "phrases") {
    return (
      <div className="space-y-6 pb-16">
        <LibrarySectionNav active="phrases" />
        <LibrarySavedPhrases />
        <LibraryMyPhrases />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LibrarySectionNav active="texts" />
      <LibraryView initialTexts={initialTexts} />
    </div>
  );
}
