"use client";

import { SECTIONS } from "./vocabulary-word-fiche-sections";

type VocabularyWordFicheNavProps = {
  visibleIds?: string[];
};

export function VocabularyWordFicheNav({ visibleIds }: VocabularyWordFicheNavProps) {
  const items = visibleIds
    ? SECTIONS.filter((section) => visibleIds.includes(section.id))
    : SECTIONS;

  return (
    <nav className="vocab-fiche-nav" aria-label="Sections de la fiche">
      {items.map((section) => (
        <a key={section.id} href={`#${section.id}`} className="vocab-fiche-nav__link focus-kb">
          {section.label}
        </a>
      ))}
    </nav>
  );
}
