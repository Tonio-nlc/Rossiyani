import type { ReactNode } from "react";

import { ManualSidebar } from "./manual-sidebar";

type ManualScholarShellProps = {
  children: ReactNode;
};

export function ManualScholarShell({ children }: ManualScholarShellProps) {
  return (
    <div className="manual-scholar">
      <ManualSidebar />
      <div className="manual-scholar__main">{children}</div>
    </div>
  );
}
