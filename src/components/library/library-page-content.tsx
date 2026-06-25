"use client";

import { useSearchParams } from "next/navigation";

import { Reference } from "@/components/editorial";

import { LibraryContextTranslationLessons } from "./library-context-translation-lessons";
import { LibraryMyDiscoveries } from "./library-my-discoveries";
import { LibraryPageIntro } from "./library-page-intro";
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
      <div className="library-ws">
        <LibraryPageIntro />
        <LibrarySectionNav active="lessons" />
        <section className="library-ws-section">
          <LibraryContextTranslationLessons />
        </section>
        <p className="library-ws-section__subtitle">
          <Reference href="/manual">Leçons de grammaire →</Reference>
        </p>
      </div>
    );
  }

  if (section === "saved") {
    return (
      <div className="library-ws">
        <LibraryPageIntro />
        <LibrarySectionNav active="saved" />
        <section className="library-ws-section">
          <p className="lib-saved-sentences-empty__hint">
            Les phrases enregistrées en lecture se trouvent dans{" "}
            <Reference href="/library?section=phrases">Mes phrases →</Reference>
          </p>
        </section>
      </div>
    );
  }

  if (section === "discoveries") {
    return (
      <div className="library-ws">
        <LibraryPageIntro />
        <LibrarySectionNav active="discoveries" />
        <section className="library-ws-section">
          <LibraryMyDiscoveries />
        </section>
      </div>
    );
  }

  if (section === "phrases") {
    return (
      <div className="library-ws">
        <LibraryPageIntro />
        <LibrarySectionNav active="phrases" />
        <section className="library-ws-section">
          <LibrarySavedSentences />
        </section>
      </div>
    );
  }

  return (
    <div className="library-ws">
      <LibraryView initialTexts={initialTexts} />
    </div>
  );
}
