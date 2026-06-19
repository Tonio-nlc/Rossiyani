import type { ReactNode } from "react";

type WorkspacePanelProps = {
  title: string;
  subtitle?: string;
  /** @deprecated Accent colors removed — panels use flat editorial surfaces. */
  accent?: "neutral" | "ending" | "concept" | "usage";
  children: ReactNode;
  className?: string;
};

/** Flat editorial microscope section — design-system surface. */
export function WorkspacePanel({
  title,
  subtitle,
  accent: _accent = "neutral",
  children,
  className = "",
}: WorkspacePanelProps) {
  return (
    <section className={["ds-microscope-panel panel-transition", className].join(" ")}>
      <header className="ds-microscope-panel-header">
        <h3 className="ds-microscope-panel-title">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-[var(--ink-muted)]">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}
