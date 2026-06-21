import type { ReactNode } from "react";

type SidebarProps = {
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
  /** Sheet = mobile overlay; inline = desktop column panel */
  variant?: "inline" | "sheet";
  open?: boolean;
  "aria-label"?: string;
};

export function Sidebar({
  title,
  children,
  onClose,
  className = "",
  variant = "inline",
  open = true,
  "aria-label": ariaLabel = "Microscope",
}: SidebarProps) {
  if (variant === "sheet") {
    if (!open) {
      return null;
    }

    return (
      <>
        {onClose ? (
          <button
            type="button"
            aria-label="Fermer"
            className="reader-word-sheet-backdrop fixed inset-0 z-40 bg-[var(--ink)]/10 lg:hidden"
            onClick={onClose}
          />
        ) : null}
        <aside
          className={[
            "ds-sidebar ds-sidebar-sheet animate-microscope-slide fixed z-50 flex max-h-[min(75vh,34rem)] w-full flex-col lg:hidden",
            "bottom-0 left-0 right-0",
            className,
          ].join(" ")}
          aria-label={ariaLabel}
        >
          {title || onClose ? (
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--hairline)] px-5 py-3">
              {title ? (
                <p className={["ds-sidebar__title", className.includes("reader-sidebar") ? "reader-sidebar__title" : "text-eyebrow normal-case tracking-[0.14em]"].join(" ")}>
                  {className.includes("reader-sidebar") ? (
                    <span className="reader-sidebar__title-inner">
                      <span className="reader-sidebar__icon" aria-hidden>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.25" />
                          <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                        </svg>
                      </span>
                      {title}
                    </span>
                  ) : (
                    title
                  )}
                </p>
              ) : (
                <span />
              )}
              {onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="focus-kb text-sm text-[var(--ink-secondary)] transition hover:text-[var(--ink)]"
                >
                  Fermer
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        </aside>
      </>
    );
  }

  if (!open) {
    return null;
  }

  return (
    <aside className={["ds-sidebar ds-sidebar-inline", className].filter(Boolean).join(" ")} aria-label={ariaLabel}>
      {title ? (
        <header className="ds-sidebar__header border-b border-[var(--hairline)] px-5 py-3">
          <p className={["ds-sidebar__title", className.includes("reader-sidebar") ? "reader-sidebar__title" : "text-eyebrow normal-case tracking-[0.14em]"].join(" ")}>
            {className.includes("reader-sidebar") ? (
              <span className="reader-sidebar__title-inner">
                <span className="reader-sidebar__icon" aria-hidden>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.25" />
                    <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                  </svg>
                </span>
                {title}
              </span>
            ) : (
              title
            )}
          </p>
        </header>
      ) : null}
      <div className="px-5 py-5">{children}</div>
    </aside>
  );
}
