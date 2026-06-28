"use client";

import type { ReactNode } from "react";

type ReaderShellProps = {
  children: ReactNode;
  wordPanel: ReactNode;
  wordPanelOpen?: boolean;
  onToggleWordPanel?: () => void;
  footer?: ReactNode;
};

export function ReaderShell({
  children,
  wordPanel,
  wordPanelOpen = true,
  onToggleWordPanel,
  footer,
}: ReaderShellProps) {
  return (
    <div className="reader-ws">
      <div className="reader-ws__body">
        <div className="reader-ws__main">{children}</div>
        <aside
          className={[
            "reader-ws__explorer",
            wordPanelOpen ? "reader-ws__explorer--open" : "reader-ws__explorer--collapsed",
          ].join(" ")}
          aria-label="Panneau mot"
        >
          {onToggleWordPanel ? (
            <button
              type="button"
              className="reader-ws__explorer-toggle focus-kb lg:hidden"
              onClick={onToggleWordPanel}
              aria-expanded={wordPanelOpen}
            >
              Mot
            </button>
          ) : null}
          <div className="reader-ws__explorer-scroll">{wordPanel}</div>
        </aside>
      </div>
      {footer}
    </div>
  );
}
