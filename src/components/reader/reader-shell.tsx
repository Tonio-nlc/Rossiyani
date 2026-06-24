"use client";

import type { ReactNode } from "react";

import { WorkspaceAppSidebar } from "@/components/layout/workspace-app-sidebar";

type ReaderShellProps = {
  children: ReactNode;
  explorer: ReactNode;
  explorerOpen?: boolean;
  onToggleExplorer?: () => void;
  footer?: ReactNode;
};

export function ReaderShell({
  children,
  explorer,
  explorerOpen = true,
  onToggleExplorer,
  footer,
}: ReaderShellProps) {
  return (
    <div className="reader-ws">
      <WorkspaceAppSidebar />
      <div className="reader-ws__body">
        <div className="reader-ws__main">{children}</div>
        <aside
          className={[
            "reader-ws__explorer",
            explorerOpen ? "reader-ws__explorer--open" : "reader-ws__explorer--collapsed",
          ].join(" ")}
          aria-label="Explorer panel"
        >
          {onToggleExplorer ? (
            <button
              type="button"
              className="reader-ws__explorer-toggle focus-kb lg:hidden"
              onClick={onToggleExplorer}
              aria-expanded={explorerOpen}
            >
              Explorer
            </button>
          ) : null}
          <div className="reader-ws__explorer-scroll">{explorer}</div>
        </aside>
      </div>
      {footer}
    </div>
  );
}
