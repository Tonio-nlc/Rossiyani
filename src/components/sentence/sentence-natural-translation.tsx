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
        "reader-sentence-block__translation reader-ws-translation",
        visible ? "reader-ws-translation--visible" : "reader-ws-translation--hidden",
      ].join(" ")}
      aria-label={`Traduction de la phrase ${sentenceId}`}
    >
      {text}
    </p>
  );
}
