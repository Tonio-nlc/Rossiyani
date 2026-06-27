"use client";

type SentenceTranslationToggleProps = {
  expanded: boolean;
  onToggle: () => void;
  hasTranslation: boolean;
};

export function SentenceTranslationToggle({
  expanded,
  onToggle,
  hasTranslation,
}: SentenceTranslationToggleProps) {
  if (!hasTranslation) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className="reader-ws-translation-toggle focus-kb"
    >
      {expanded ? (
        <>
          Masquer la traduction <span aria-hidden>↓</span>
        </>
      ) : (
        <>
          Afficher la traduction <span aria-hidden>→</span>
        </>
      )}
    </button>
  );
}
