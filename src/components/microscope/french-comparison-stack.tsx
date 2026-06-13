import type { WordDetailGraph } from "@/types/word-detail-graph";

type FrenchComparisonStackProps = {
  detail: WordDetailGraph;
};

function StackStep({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0 text-center">
      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
      <p
        className={[
          "mt-0.5 truncate font-reader text-sm font-semibold sm:text-base",
          accent ? "text-[var(--accent-cyan-bright)]" : "text-[var(--foreground)]",
        ].join(" ")}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

export function FrenchComparisonStack({ detail }: FrenchComparisonStackProps) {
  const comparison = detail.frenchComparison;
  const canonical = detail.frenchComparisonCanonical;
  const russianWord = detail.occurrence.original;
  const frenchText =
    comparison?.frenchStructure ??
    detail.occurrence.explanation.slice(0, 120);
  const difference =
    canonical ??
    comparison?.whyDifferent ??
    "Le russe encode la fonction grammaticale dans la terminaison — le français utilise l'ordre et les prépositions.";

  return (
    <div className="microscope-comparison animate-microscope-in rounded-xl border border-[var(--border)] bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--surface)] p-3 sm:p-4">
      <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:gap-2">
        <StackStep label="Russe" value={russianWord} accent />
        <span className="hidden text-sm text-[var(--accent-violet)]/50 sm:inline" aria-hidden>
          →
        </span>
        <StackStep label="Forme analysée" value={detail.occurrence.stressMarked} />
        <span className="hidden text-sm text-[var(--accent-violet)]/50 sm:inline" aria-hidden>
          →
        </span>
        <StackStep label="Français" value={frenchText} />
      </div>

      <div className="mt-2 border-t border-[var(--border)]/80 pt-2 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
          Différence
        </p>
        <p className="mx-auto mt-1 max-w-2xl text-xs leading-snug text-[var(--muted)]">
          {difference}
        </p>
      </div>
    </div>
  );
}
