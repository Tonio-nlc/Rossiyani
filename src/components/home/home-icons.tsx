type IconProps = {
  className?: string;
};

export function HomeIconImport({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M10 3.5v9M6.5 9 10 12.5 13.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 16.5h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function HomeIconRead({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M4 4.5h12v11H4z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 8h6M7 11h6M7 14h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function HomeIconExplore({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10 6.5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function HomeIconPractice({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M6 4.5h8v11H6z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8.5 8h3M8.5 11h3M8.5 14h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function HomeIconContent({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M4 5.5h12M4 10h8M4 14.5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function HomeIconAnalysis({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M5 14.5 9 5.5l6 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 12.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function HomeIconNetwork({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <circle cx="10" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="5.5" cy="14.5" r="2" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="14.5" cy="14.5" r="2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M10 7.5v3M8.2 12.8 6.8 13.8M11.8 12.8l1.4 1" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export function HomeIconManual({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M5 3.5h10v13H5z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 3.5v13" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10.5 7h4M10.5 10h4M10.5 13h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
