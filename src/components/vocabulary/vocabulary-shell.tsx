import type { ReactNode } from "react";

export function VocabularyShell({ children }: { children: ReactNode }) {
  return <div className="vocabulary-shell">{children}</div>;
}
