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
      className="focus-kb mt-2 text-left text-xs text-[var(--ink-muted)] underline-offset-2 transition hover:text-[var(--ink)] hover:underline"
    >
      {expanded ? (
        <>
          Hide translation <span aria-hidden>↓</span>
        </>
      ) : (
        <>
          Show translation <span aria-hidden>→</span>
        </>
      )}
    </button>
  );
}
