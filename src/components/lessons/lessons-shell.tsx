import type { ReactNode } from "react";

export function LessonsShell({ children }: { children: ReactNode }) {
  return <div className="lessons-shell">{children}</div>;
}
