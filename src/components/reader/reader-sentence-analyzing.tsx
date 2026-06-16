"use client";

type ReaderSentenceAnalyzingProps = {
  russianText: string;
  showTranslation: boolean;
  naturalTranslation: string;
  onToggleTranslation: () => void;
};

export function ReaderSentenceAnalyzing({
  russianText,
  showTranslation,
  naturalTranslation,
  onToggleTranslation,
}: ReaderSentenceAnalyzingProps) {
  return (
    <div className="space-y-4 border-b border-[var(--hairline)] py-4">
      <p className="break-russian font-reader text-[clamp(1.125rem,2.5vw,1.375rem)] leading-relaxed text-[var(--ink)]">
        {russianText}
      </p>

      {showTranslation ? (
        <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">{naturalTranslation}</p>
      ) : (
        <button
          type="button"
          onClick={onToggleTranslation}
          className="focus-kb text-xs text-[var(--ink-muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
        >
          Show translation →
        </button>
      )}

      <div className="space-y-2 pt-1">
        <p className="text-sm text-[var(--ink-muted)]">Analyzing…</p>
        <ul className="space-y-1 text-xs text-[var(--ink-muted)]">
          <li>○ vocabulary</li>
          <li>○ grammar</li>
          <li>○ highlights</li>
        </ul>
      </div>
    </div>
  );
}

function isSentenceAnalyzing(analysisState: string, wordCount: number): boolean {
  return (
    analysisState === "PENDING" ||
    analysisState === "PROCESSING" ||
    (analysisState === "FAILED" && wordCount === 0)
  );
}

export { isSentenceAnalyzing };
