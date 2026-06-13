type SentenceNaturalTranslationProps = {
  sentenceId: string;
  text: string;
};

export function SentenceNaturalTranslation({
  sentenceId,
  text,
}: SentenceNaturalTranslationProps) {
  if (!text.trim()) {
    return null;
  }

  return (
    <p
      className="animate-sentence-translation-fade mt-[var(--space-3)] max-w-[92%] text-metadata italic leading-relaxed text-[var(--ink-muted)]"
      aria-label={`Traduction de la phrase ${sentenceId}`}
    >
      {text}
    </p>
  );
}
