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
    <div className="reader-ws-analyzing">
      <p className="reader-ws-analyzing__russian break-russian">{russianText}</p>

      {showTranslation ? (
        <p className="reader-ws-analyzing__translation">{naturalTranslation}</p>
      ) : (
        <button type="button" onClick={onToggleTranslation} className="reader-ws-translation-toggle focus-kb">
          Show translation →
        </button>
      )}

      <div className="reader-ws-analyzing__status">
        <p className="reader-ws-analyzing__status-label">Analyzing…</p>
        <ul className="reader-ws-analyzing__status-list">
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
