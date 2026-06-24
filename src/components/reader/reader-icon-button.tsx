type ReaderIconButtonProps = {
  label: string;
  onClick?: () => void;
  active?: boolean;
  children: React.ReactNode;
};

export function ReaderIconButton({ label, onClick, active = false, children }: ReaderIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={["reader-ws-icon-btn focus-kb", active ? "reader-ws-icon-btn--active" : ""]
        .filter(Boolean)
        .join(" ")}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

export function ReaderIconSearch() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="reader-ws-icon-btn__svg">
      <circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ReaderIconTextSize() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="reader-ws-icon-btn__svg">
      <path d="M5 5.5h4l3 9M12 5.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ReaderIconBookmark({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="reader-ws-icon-btn__svg">
      <path
        d="M6 4.5h8v12l-4-2.5L6 16.5V4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

export function ReaderIconMore() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="reader-ws-icon-btn__svg">
      <circle cx="5" cy="10" r="1.25" fill="currentColor" />
      <circle cx="10" cy="10" r="1.25" fill="currentColor" />
      <circle cx="15" cy="10" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function ReaderIconSpeaker() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="reader-ws-icon-btn__svg">
      <path d="M5 8.5v3h2.5L11 15V5L7.5 8.5H5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M13.5 7.5a3 3 0 0 1 0 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ReaderIconSave() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="reader-ws-icon-btn__svg">
      <path
        d="M6 4.5h8v11H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M8 4.5v4h4v-4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
