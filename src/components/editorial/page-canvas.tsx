import type { ReactNode } from "react";

type PageCanvasProps = {
  children: ReactNode;
  /** Reader routes use full frame width for the two-column reading surface. */
  variant?: "default" | "reader";
  className?: string;
};

/**
 * Global editorial content frame — unified max width, padding, and rhythm.
 */
export function PageCanvas({ children, variant = "default", className = "" }: PageCanvasProps) {
  return (
    <div
      className={[
        "editorial-shell mx-auto w-full min-w-0",
        "pb-[var(--layout-section-gap)]",
        variant === "reader" ? "pt-[var(--layout-gap)]" : "pt-[clamp(1rem,2vw,2rem)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
