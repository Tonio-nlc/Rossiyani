import type { ReactNode } from "react";

import { ExplorerStudyShell } from "./explorer-study-shell";
import { ExplorerStudySidebar } from "./explorer-study-sidebar";

type ExplorerWorkspaceLayoutProps = {
  children: ReactNode;
  microscope: ReactNode;
};

export function ExplorerWorkspaceLayout({ children, microscope }: ExplorerWorkspaceLayoutProps) {
  return (
    <div className="explorer-study-root">
      <ExplorerStudyShell
        sidebar={<ExplorerStudySidebar />}
        main={children}
        microscope={microscope}
      />
    </div>
  );
}
