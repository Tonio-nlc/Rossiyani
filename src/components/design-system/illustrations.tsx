type IllustrationProps = {
  className?: string;
  size?: number;
};

const defaultSize = 32;

export function IllustrationBook({ className = "", size = defaultSize }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M8 6.5h7.5a2 2 0 0 1 2 2V25H10a2 2 0 0 1-2-2V6.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 8.5H24a2 2 0 0 1 2 2V25H17.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M11 11h4M11 14.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function IllustrationLibrary({ className = "", size = defaultSize }: IllustrationProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" aria-hidden className={className}>
      <rect x="6" y="8" width="5" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13.5" y="6" width="5" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="21" y="10" width="5" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IllustrationVocabulary({ className = "", size = defaultSize }: IllustrationProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" aria-hidden className={className}>
      <circle cx="11" cy="14" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 19 22 25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 11h6M23 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IllustrationLessons({ className = "", size = defaultSize }: IllustrationProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" aria-hidden className={className}>
      <path
        d="M6 10.5 16 6l10 4.5L16 15 6 10.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M11 13v7.5l5 2.5 5-2.5V13" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function IllustrationPractice({ className = "", size = defaultSize }: IllustrationProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" aria-hidden className={className}>
      <path
        d="M8 22V12l8-4 8 4v10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 18h8M12 14.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IllustrationReader({ className = "", size = defaultSize }: IllustrationProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" aria-hidden className={className}>
      <path
        d="M9 8h14v16H9a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M11 12h10M11 16h8M11 20h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function IllustrationSearch({ className = "", size = defaultSize }: IllustrationProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" aria-hidden className={className}>
      <circle cx="14" cy="14" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18.5 18.5 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
