import type { ReactNode } from "react";

type WorkspacePanelProps = {
  title: string;
  subtitle?: string;
  accent?: "neutral" | "ending" | "concept" | "usage";
  children: ReactNode;
  className?: string;
};

const ACCENT_STYLES = {
  neutral: "border-neutral-200/70 bg-white/95",
  ending: "border-violet-200/60 bg-gradient-to-br from-violet-50/50 via-white to-white",
  concept: "border-cyan-200/60 bg-gradient-to-br from-cyan-50/30 via-white to-white",
  usage: "border-amber-200/50 bg-gradient-to-br from-amber-50/25 via-white to-white",
} as const;

export function WorkspacePanel({
  title,
  subtitle,
  accent = "neutral",
  children,
  className = "",
}: WorkspacePanelProps) {
  return (
    <section
      className={[
        "rounded-xl border p-4 shadow-sm backdrop-blur-sm panel-transition sm:p-5",
        ACCENT_STYLES[accent],
        className,
      ].join(" ")}
    >
      <header className="mb-4 border-b border-neutral-100/80 pb-2.5">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
          {title}
        </h3>
        {subtitle ? <p className="mt-0.5 text-[11px] text-neutral-400">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}
