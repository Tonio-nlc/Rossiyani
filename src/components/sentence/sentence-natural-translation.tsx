type SentenceNaturalTranslationProps = {
  sentenceId: string;
  text: string;
  visible?: boolean;
};

export function SentenceNaturalTranslation({
  sentenceId,
  text,
  visible = true,
}: SentenceNaturalTranslationProps) {
  if (!text.trim()) {
    return null;
  }

  return (
    <p
      className={[
        "reader-sentence-block__translation mt-2 max-w-[92%] italic leading-relaxed text-[var(--ink-muted)]",
        visible ? "animate-sentence-translation-fade opacity-100" : "opacity-0",
      ].join(" ")}
      aria-label={`Traduction de la phrase ${sentenceId}`}
    >
      {text}
    </p>
  );
}
