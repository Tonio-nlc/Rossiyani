import type { ReactNode } from "react";

import type { SemanticColor } from "@/design-system/tokens";

type MarginNoteKind = "grammar" | "usage" | "culture" | "exception" | "reference" | "frequency";

const kindConfig: Record<MarginNoteKind, { label: string; colorClass: string }> = {
  grammar: { label: "Grammaire", colorClass: "text-grammar" },
  usage: { label: "Usage", colorClass: "text-link" },
  culture: { label: "Culture", colorClass: "text-culture" },
  exception: { label: "Exception", colorClass: "text-exception" },
  reference: { label: "Voir aussi", colorClass: "text-link" },
  frequency: { label: "Fréquence", colorClass: "text-link" },
};

const borderColor: Record<SemanticColor, string> = {
  link: "var(--color-link)",
  grammar: "var(--color-grammar)",
  culture: "var(--color-culture)",
  exception: "var(--color-exception)",
};

type MarginNoteProps = {
  kind: MarginNoteKind;
  children: ReactNode;
  className?: string;
};

export function MarginNote({ kind, children, className = "" }: MarginNoteProps) {
  const config = kindConfig[kind];
  const semantic: SemanticColor =
    kind === "grammar"
      ? "grammar"
      : kind === "culture"
        ? "culture"
        : kind === "exception"
          ? "exception"
          : "link";

  return (
    <aside
      className={[
        "border-l-2 py-1 pl-4 text-sm leading-relaxed text-[var(--ink-secondary)]",
        className,
      ].join(" ")}
      style={{ borderColor: borderColor[semantic] }}
    >
      <p className={`mb-1 text-[var(--text-meta)] font-semibold uppercase tracking-wider ${config.colorClass}`}>
        {config.label}
      </p>
      <div>{children}</div>
    </aside>
  );
}
