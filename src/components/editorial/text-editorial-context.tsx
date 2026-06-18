import Link from "next/link";

import { getCollectionName } from "@/content/collections";

type TextEditorialContextProps = {
  title: string;
  collectionId: string;
  eyebrow?: string;
  href?: string | null;
  size?: "sm" | "md";
  className?: string;
};

const TITLE_CLASS = {
  sm: "text-sm font-medium text-[var(--ink)]",
  md: "font-reader text-base font-medium text-[var(--ink)] sm:text-lg",
} as const;

const COLLECTION_CLASS = {
  sm: "text-xs text-[var(--ink-secondary)]",
  md: "text-sm text-[var(--ink-secondary)]",
} as const;

export function TextEditorialContext({
  title,
  collectionId,
  eyebrow,
  href,
  size = "md",
  className = "",
}: TextEditorialContextProps) {
  const collectionName = getCollectionName(collectionId);

  const content = (
    <>
      {eyebrow ? (
        <p className="home-section-label">{eyebrow}</p>
      ) : null}
      <p className={TITLE_CLASS[size]}>{title}</p>
      <p className={COLLECTION_CLASS[size]}>{collectionName}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={[
          "focus-kb block space-y-1 transition hover:opacity-90",
          className,
        ].join(" ")}
      >
        {content}
      </Link>
    );
  }

  return <div className={["space-y-1", className].join(" ")}>{content}</div>;
}
