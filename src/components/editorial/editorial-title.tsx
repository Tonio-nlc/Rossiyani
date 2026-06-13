import type { ReactNode } from "react";

type EditorialTitleProps = {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  variant?: "hero" | "page" | "section";
  className?: string;
};

const variantClass = {
  hero: "editorial-hero",
  page: "editorial-title",
  section: "editorial-section-title",
} as const;

export function EditorialTitle({
  children,
  as: Tag = "h1",
  variant = "page",
  className = "",
}: EditorialTitleProps) {
  return <Tag className={[variantClass[variant], className].filter(Boolean).join(" ")}>{children}</Tag>;
}
