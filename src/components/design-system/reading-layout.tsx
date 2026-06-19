import type { ReactNode } from "react";

type ReadingLayoutProps = {
  main: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

/**
 * Reader layout — centered text column with optional microscope sidebar on desktop.
 * Pass mobile sheet sidebar separately via Sidebar variant="sheet".
 */
export function ReadingLayout({ main, sidebar, footer, className = "" }: ReadingLayoutProps) {
  return (
    <div className={["ds-reading-layout", className].filter(Boolean).join(" ")}>
      <div className="ds-reading-main">{main}</div>
      {sidebar ? <div className="ds-reading-sidebar hidden lg:block">{sidebar}</div> : null}
      {footer ? <div className="ds-reading-footer">{footer}</div> : null}
    </div>
  );
}
