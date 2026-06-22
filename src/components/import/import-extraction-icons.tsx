type IconProps = {
  className?: string;
};

export function ImportIconWords({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M4 5.5h12M4 10h8M4 14.5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function ImportIconConcepts({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10 6.5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function ImportIconCases({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M4 4.5h12v11H4z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 8h6M7 11h6M7 14h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function ImportIconEndings({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M5 14.5 9 5.5l6 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 12.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function ImportIconExpressions({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path
        d="M5.5 8.5c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path d="M5.5 11.5h9M7 14.5h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function ImportIconPractice({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M6 4.5h8v11H6z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8.5 8h3M8.5 11h3M8.5 14h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function ImportIconExtraction({ className }: IconProps) {
  return <ImportIconConcepts className={className} />;
}

export function ImportIconPipeline({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M4 5h12M4 10h12M4 15h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7" cy="5" r="1.2" fill="currentColor" />
      <circle cx="11" cy="10" r="1.2" fill="currentColor" />
      <circle cx="9" cy="15" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function ImportIconPreview({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M4 6.5h12v7H4z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 9.5h6M7 12h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
