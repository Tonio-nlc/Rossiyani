import type { ReactNode } from "react";

type ExplorerStudyShellProps = {
  sidebar: ReactNode;
  main: ReactNode;
  microscope?: ReactNode | null;
};

export function ExplorerStudyShell({ sidebar, main, microscope }: ExplorerStudyShellProps) {
  return (
    <div
      className={[
        "explorer-study-shell",
        microscope ? "explorer-study-shell--with-microscope" : "",
      ].join(" ")}
    >
      {sidebar}
      <div className="explorer-study-shell__main">{main}</div>
      {microscope ? <aside className="explorer-study-shell__microscope">{microscope}</aside> : null}
    </div>
  );
}
