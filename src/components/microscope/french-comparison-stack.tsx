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
      <p className="text-eyebrow">{label}</p>
      <p
        className={[
          "mt-1 truncate font-reader text-sm font-semibold sm:text-base",
          accent ? "text-[var(--color-primary)]" : "text-[var(--ink)]",
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
    comparison?.frenchStructure ?? detail.occurrence.explanation.slice(0, 120);
  const difference =
    canonical ??
    comparison?.whyDifferent ??
    "Le russe encode la fonction grammaticale dans la terminaison — le français utilise l'ordre et les prépositions.";

  return (
    <div className="microscope-comparison animate-microscope-in ds-microscope-panel">
      <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:gap-2">
        <StackStep label="Russe" value={russianWord} accent />
        <span className="hidden text-sm text-[var(--ink-muted)] sm:inline" aria-hidden>
          →
        </span>
        <StackStep label="Forme analysée" value={detail.occurrence.stressMarked} />
        <span className="hidden text-sm text-[var(--ink-muted)] sm:inline" aria-hidden>
          →
        </span>
        <StackStep label="Français" value={frenchText} />
      </div>

      <div className="mt-3 border-t border-[var(--hairline)] pt-3 text-center">
        <p className="text-eyebrow">Différence</p>
        <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-[var(--ink-muted)]">
          {difference}
        </p>
      </div>
    </div>
  );
}
