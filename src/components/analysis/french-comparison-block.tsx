import type { FrenchComparison } from "@/features/grammar";

type FrenchComparisonBlockProps = {
  comparison: FrenchComparison;
};

export function FrenchComparisonBlock({ comparison }: FrenchComparisonBlockProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-600">
        Russe vs français
      </h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase text-neutral-400">Structure russe</p>
          <p className="mt-1 text-lg font-medium text-neutral-900">{comparison.russianStructure}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase text-neutral-400">Structure française</p>
          <p className="mt-1 text-lg font-medium text-neutral-800">{comparison.frenchStructure}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-neutral-700">
        <span className="font-semibold text-neutral-600">Pourquoi : </span>
        {comparison.whyDifferent}
      </p>
    </section>
  );
}
