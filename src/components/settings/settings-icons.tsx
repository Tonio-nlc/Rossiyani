import type { SettingsSectionId } from "./settings-types";

type IconProps = {
  className?: string;
};

export function SettingsSectionIcon({
  id,
  className,
}: {
  id: SettingsSectionId;
  className?: string;
}) {
  switch (id) {
    case "reading":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
          <path d="M4 4.5h12v11H4z" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7 8h6M7 11h6M7 14h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "practice":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
          <path d="M6 4.5h8v11H6z" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8.5 8h3M8.5 11h3M8.5 14h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "library":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
          <path d="M5 4.5h7a2 2 0 0 1 2 2v9H7a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.2" />
          <path d="M9 4.5V16" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "account":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
          <circle cx="10" cy="6.5" r="2.75" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M4.5 16.5c0-2.6 2.2-4.5 5.5-4.5s5.5 1.9 5.5 4.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "appearance":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
          <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M10 3.5v13M3.5 10h13" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    case "advanced":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
          <path d="M4 4.5h12M4 8h12M4 11.5h8M4 15h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
  }
}

export function SettingsWorkspaceIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10 6.5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
