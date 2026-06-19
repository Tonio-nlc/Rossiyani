import type { ReactNode } from "react";

type EditorialContainerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "main";
};

/** Max-width editorial frame — design-system.md: 1024px */
export function EditorialContainer({
  children,
  className = "",
  as: Tag = "div",
}: EditorialContainerProps) {
  return (
    <Tag className={["ds-editorial-container mx-auto w-full min-w-0", className].join(" ")}>
      {children}
    </Tag>
  );
}
