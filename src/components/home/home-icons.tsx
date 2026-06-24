type IconProps = {
  className?: string;
};

const STROKE = 1.5;

export function HomeIconImport({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M12 4v10m0 0 3.5-3.5M12 14l-3.5-3.5M5 19h14"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomeIconRead({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M7 5.5h10a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth={STROKE}
      />
      <path
        d="M9 10h6M9 13.5h6M9 17h4"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HomeIconExplore({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeWidth={STROKE} />
      <path
        d="M12 8.25V12l2.75 1.75"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomeIconPractice({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M8.5 5.5h7a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth={STROKE}
      />
      <path
        d="M10.5 10h5M10.5 13.5h5M10.5 17h3.5"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HomeIconContent({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M6.5 7.5h11M6.5 12h8M6.5 16.5h9"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HomeIconAnalysis({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M6.5 17.5 10.5 7.5l7 10"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 14.5h6" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
    </svg>
  );
}

export function HomeIconNetwork({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle cx="12" cy="7" r="2.25" stroke="currentColor" strokeWidth={STROKE} />
      <circle cx="7" cy="17" r="2.25" stroke="currentColor" strokeWidth={STROKE} />
      <circle cx="17" cy="17" r="2.25" stroke="currentColor" strokeWidth={STROKE} />
      <path
        d="M12 9.25v4M9.6 15.1 8.4 15.9M14.4 15.1l1.2.8"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HomeIconManual({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M7 5.5h10v13H7a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth={STROKE}
      />
      <path d="M10 5.5v13" stroke="currentColor" strokeWidth={STROKE} />
      <path
        d="M12.5 9.5h5M12.5 12.5h5M12.5 15.5h4"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </svg>
  );
}
