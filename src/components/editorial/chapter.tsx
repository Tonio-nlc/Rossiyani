import type { ReactNode } from "react";

type ChapterProps = {
  children: ReactNode;
  className?: string;
  /** Use full content width (1200) instead of reading width (760). */
  wide?: boolean;
};

/** Editorial reading column — sits inside EditorialContainer from AppShell. */
export function Chapter({ children, className = "", wide = false }: ChapterProps) {
  return (
    <article
      className={[
        wide ? "w-full" : "editorial-reading-column w-full",
        "pb-[var(--space-7)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </article>
  );
}
