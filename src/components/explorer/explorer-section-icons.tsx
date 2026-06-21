import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    />
  );
}

export type ExplorerSectionIconId =
  | "definitions"
  | "examples"
  | "texts"
  | "related-words"
  | "related-concepts"
  | "meaning"
  | "usage"
  | "function"
  | "question"
  | "role"
  | "similar";

export function ExplorerSectionIcon({
  id,
  className,
}: {
  id: ExplorerSectionIconId;
  className?: string;
}) {
  const cn = className ?? "explorer-word-section__icon";

  switch (id) {
    case "definitions":
      return (
        <BaseIcon className={cn}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </BaseIcon>
      );
    case "examples":
      return (
        <BaseIcon className={cn}>
          <path d="m12 3-1.9 5.8H4l4.9 3.6-1.9 5.8L12 14.6l4.9 3.6-1.9-5.8L20 8.8h-6.1z" />
        </BaseIcon>
      );
    case "texts":
      return (
        <BaseIcon className={cn}>
          <path d="M3 7h5l2 2h11v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M3 7V5a2 2 0 0 1 2-2h5l2 2" />
        </BaseIcon>
      );
    case "related-words":
      return (
        <BaseIcon className={cn}>
          <path d="M7 7h10" />
          <path d="M7 12h10" />
          <path d="M7 17h6" />
          <path d="m14 17 3 3" />
          <path d="m17 14 3 3" />
        </BaseIcon>
      );
    case "related-concepts":
      return (
        <BaseIcon className={cn}>
          <path d="M9.5 2A5.5 5.5 0 0 0 4 7.5c0 3.04 2.46 5.5 5.5 5.5h1V7.5A5.5 5.5 0 0 0 9.5 2z" />
          <path d="M14.5 2A5.5 5.5 0 0 1 20 7.5c0 3.04-2.46 5.5-5.5 5.5h-1V7.5A5.5 5.5 0 0 1 14.5 2z" />
        </BaseIcon>
      );
    case "meaning":
      return (
        <BaseIcon className={cn}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </BaseIcon>
      );
    case "usage":
      return (
        <BaseIcon className={cn}>
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        </BaseIcon>
      );
    case "function":
      return (
        <BaseIcon className={cn}>
          <path d="M12 3v18" />
          <path d="M5 8h14" />
          <path d="M7 16h10" />
        </BaseIcon>
      );
    case "question":
      return (
        <BaseIcon className={cn}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 0 1 4 2c0 2-2.5 2-2.5 4" />
          <path d="M12 17h.01" />
        </BaseIcon>
      );
    case "role":
      return (
        <BaseIcon className={cn}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </BaseIcon>
      );
    case "similar":
      return (
        <BaseIcon className={cn}>
          <path d="m8 3 4 8 4-8" />
          <path d="M4 21h16" />
          <path d="M9 15h6" />
        </BaseIcon>
      );
    default:
      return null;
  }
}
