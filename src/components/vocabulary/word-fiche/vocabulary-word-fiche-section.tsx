"use client";

import { useCallback, useState, type ReactNode } from "react";

type VocabularyWordFicheSectionProps = {
  id: string;
  title: string;
  summary?: string | null;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function VocabularyWordFicheSection({
  id,
  title,
  summary = null,
  defaultOpen = true,
  children,
}: VocabularyWordFicheSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  const toggle = useCallback(() => {
    setOpen((value) => !value);
  }, []);

  return (
    <section id={id} className="vocab-fiche-section" aria-labelledby={`${id}-title`}>
      <button
        type="button"
        className="vocab-fiche-section__toggle focus-kb"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
      >
        <span className="vocab-fiche-section__toggle-copy">
          <span id={`${id}-title`} className="vocab-fiche-section__title">
            {title}
          </span>
          {summary && !open ? (
            <span className="vocab-fiche-section__summary">{summary}</span>
          ) : null}
        </span>
        <span className="vocab-fiche-section__chevron" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>
      <div
        id={`${id}-panel`}
        className={[
          "vocab-fiche-section__panel",
          open ? "vocab-fiche-section__panel--open" : "vocab-fiche-section__panel--closed",
        ].join(" ")}
      >
        <div className="vocab-fiche-section__content">{children}</div>
      </div>
    </section>
  );
}
