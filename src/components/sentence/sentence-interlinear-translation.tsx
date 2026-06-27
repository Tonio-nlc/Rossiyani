type SentenceInterlinearTranslationProps = {
  text: string;
  visible?: boolean;
};

export function SentenceInterlinearTranslation({
  text,
  visible = true,
}: SentenceInterlinearTranslationProps) {
  if (!visible || !text.trim()) {
    return null;
  }

  return (
    <p className="reader-ws-interlinear" aria-label="Traduction interlinéaire">
      {text}
    </p>
  );
}
