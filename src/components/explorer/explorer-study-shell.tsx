import type { ReactNode } from "react";

type ExplorerStudyShellProps = {
  sidebar: ReactNode;
  main: ReactNode;
  microscope: ReactNode;
};

export function ExplorerStudyShell({ sidebar, main, microscope }: ExplorerStudyShellProps) {
  return (
    <div className="explorer-study-shell">
      {sidebar}
      <div className="explorer-study-shell__main">{main}</div>
      <aside className="explorer-study-shell__microscope">{microscope}</aside>
    </div>
  );
}
