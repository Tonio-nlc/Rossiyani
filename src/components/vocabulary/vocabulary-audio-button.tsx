type VocabularyAudioButtonProps = {
  label?: string;
  disabled?: boolean;
};

export function VocabularyAudioButton({
  label = "Écouter",
  disabled = true,
}: VocabularyAudioButtonProps) {
  return (
    <button
      type="button"
      className="vocabulary-audio focus-kb"
      disabled={disabled}
      aria-label={label}
      title="Audio bientôt disponible"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <svg viewBox="0 0 20 20" fill="none" aria-hidden className="vocabulary-audio__icon">
        <path
          d="M10 4.5 6.5 7H4.5v6H6.5L10 15.5V4.5Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M13.25 8.25a2.75 2.75 0 0 1 0 3.5M15.25 6.25a5.75 5.75 0 0 1 0 7.5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
