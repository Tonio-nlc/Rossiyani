import { FrenchComparisonBlock } from "@/components/analysis/french-comparison-block";
import type { WordDetailGraph } from "@/types/word-detail-graph";

type WhyThisFormPanelProps = {
  detail: WordDetailGraph;
};

export function WhyThisFormPanel({ detail }: WhyThisFormPanelProps) {
  const { canonicalExplanation, grammaticalReason, frenchComparison, frenchComparisonCanonical } =
    detail;
  const hasCanonical = canonicalExplanation !== detail.occurrence.explanation;

  return (
    <div className="space-y-4 animate-shared-enter" style={{ animationDelay: "60ms" }}>
      <section className="rounded-lg border-2 border-amber-300/80 bg-amber-50/70 p-4">
        <h4 className="text-xs font-bold uppercase tracking-wide text-amber-900">
          Explication {hasCanonical ? "canonique" : "de la phrase"}
        </h4>
        <p className="mt-2 text-base leading-relaxed text-neutral-900">{canonicalExplanation}</p>
        {hasCanonical ? (
          <p className="mt-3 border-t border-amber-200/80 pt-3 text-sm text-neutral-600">
            <span className="font-medium text-neutral-500">Dans ce texte : </span>
            {detail.occurrence.explanation}
          </p>
        ) : null}
      </section>

      {grammaticalReason && grammaticalReason !== canonicalExplanation ? (
        <section className="rounded-lg border border-neutral-200 bg-white p-3">
          <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-500">
            Raison grammaticale
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-neutral-800">{grammaticalReason}</p>
        </section>
      ) : null}

      {frenchComparisonCanonical ? (
        <section className="rounded-lg border border-blue-200 bg-blue-50/60 p-3">
          <h4 className="text-xs font-bold uppercase tracking-wide text-blue-900">
            Français ↔ Russe
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-neutral-800">
            {frenchComparisonCanonical}
          </p>
        </section>
      ) : frenchComparison ? (
        <FrenchComparisonBlock comparison={frenchComparison} />
      ) : null}
    </div>
  );
}
