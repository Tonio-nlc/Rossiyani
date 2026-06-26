"use client";

import { Badge } from "@/components/design-system";
import type { VocabularyStats, VocabularyTab } from "@/lib/vocabulary";

const TABS: Array<{ id: VocabularyTab; label: string }> = [
  { id: "words", label: "Words" },
  { id: "expressions", label: "Expressions" },
  { id: "sentences", label: "Sentences" },
];

const TAB_BADGE_TONE = {
  words: "blue",
  expressions: "violet",
  sentences: "green",
} as const;

type VocabularyNavProps = {
  active: VocabularyTab;
  stats: VocabularyStats;
  onChange: (tab: VocabularyTab) => void;
};

function countForTab(tab: VocabularyTab, stats: VocabularyStats): number {
  switch (tab) {
    case "words":
      return stats.words;
    case "expressions":
      return stats.expressions;
    case "sentences":
      return stats.sentences;
  }
}

export function VocabularyNav({ active, stats, onChange }: VocabularyNavProps) {
  return (
    <nav className="vocabulary-nav" aria-label="Catégories de vocabulaire">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            className={[
              "vocabulary-nav__tab",
              `vocabulary-nav__tab--${tab.id}`,
              isActive ? "vocabulary-nav__tab--active" : "",
              "focus-kb",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
            <Badge tone={TAB_BADGE_TONE[tab.id]} active={isActive} className="vocabulary-nav__count">
              {countForTab(tab.id, stats)}
            </Badge>
          </button>
        );
      })}
    </nav>
  );
}
