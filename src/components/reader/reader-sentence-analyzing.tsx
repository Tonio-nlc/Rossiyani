"use client";

import { SentenceInterlinearTranslation } from "@/components/sentence/sentence-interlinear-translation";
import { SentenceNaturalTranslation } from "@/components/sentence/sentence-natural-translation";

import { SentenceTranslationToggle } from "./sentence-translation-toggle";

type ReaderSentenceAnalyzingProps = {
  russianText: string;
  literalTranslation: string;
  showTranslation: boolean;
  showTranslationToggle: boolean;
  showInterlinear: boolean;
  naturalTranslation: string;
  onToggleTranslation: () => void;
};

export function ReaderSentenceAnalyzing({
  russianText,
  literalTranslation,
  showTranslation,
  showTranslationToggle,
  showInterlinear,
  naturalTranslation,
  onToggleTranslation,
}: ReaderSentenceAnalyzingProps) {
  const hasTranslation = Boolean(naturalTranslation?.trim());

  return (
    <div className="reader-ws-analyzing">
      <p className="reader-ws-analyzing__russian break-russian">{russianText}</p>

      <SentenceInterlinearTranslation
        text={literalTranslation}
        visible={showInterlinear && Boolean(literalTranslation?.trim())}
      />

      {showTranslation && hasTranslation ? (
        <SentenceNaturalTranslation
          sentenceId="analyzing"
          text={naturalTranslation}
          visible
        />
      ) : showTranslationToggle && hasTranslation ? (
        <SentenceTranslationToggle
          expanded={false}
          onToggle={onToggleTranslation}
          hasTranslation={hasTranslation}
        />
      ) : null}

      <div className="reader-ws-analyzing__status">
        <p className="reader-ws-analyzing__status-label">Analyse en cours…</p>
        <ul className="reader-ws-analyzing__status-list">
          <li>○ vocabulaire</li>
          <li>○ grammaire</li>
          <li>○ surlignages</li>
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
