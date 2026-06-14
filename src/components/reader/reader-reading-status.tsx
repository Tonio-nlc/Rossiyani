type ReaderReadingStatusProps = {
  currentPhraseIndex: number;
  totalPhrases: number;
  sentencePercent: number;
  wordPercent: number;
};

export function ReaderReadingStatus({
  currentPhraseIndex,
  totalPhrases,
  sentencePercent,
  wordPercent,
}: ReaderReadingStatusProps) {
  if (totalPhrases <= 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] px-4 py-3 text-sm">
      <span className="font-medium text-[var(--ink)]">
        Phrase {currentPhraseIndex} / {totalPhrases}
      </span>
      <span className="text-[var(--ink-muted)]">
        {sentencePercent}% read · {wordPercent}% words
      </span>
    </div>
  );
}
