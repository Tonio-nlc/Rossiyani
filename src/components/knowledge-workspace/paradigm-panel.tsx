import { EndingBadge } from "@/components/analysis/ending-badge";
import { formatCaseLabelFr } from "@/features/grammar";
import type { WordDetailGraph } from "@/types/word-detail-graph";

type ParadigmPanelProps = {
  detail: WordDetailGraph;
  onSelectForm?: (original: string) => void;
  loading?: boolean;
};

export function ParadigmPanel({ detail, onSelectForm, loading }: ParadigmPanelProps) {
  const forms = detail.lemmaKnowledge?.forms ?? [];
  const currentOriginal = detail.occurrence.original;

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 animate-pulse rounded bg-neutral-100" />
        ))}
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Aucune autre forme connue pour ce lemme. Elle apparaîtra au fil des imports.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto animate-shared-enter" style={{ animationDelay: "120ms" }}>
      <table className="w-full min-w-[280px] text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-[10px] uppercase tracking-wide text-neutral-400">
            <th className="pb-2 pr-3 font-semibold">Forme</th>
            <th className="pb-2 pr-3 font-semibold">Cas</th>
            <th className="pb-2 font-semibold">Term.</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {forms.map((form) => {
            const isActive = form.original === currentOriginal;
            return (
              <tr
                key={form.id}
                className={[
                  "panel-transition",
                  isActive
                    ? "bg-violet-50/90 ring-1 ring-inset ring-violet-300"
                    : "hover:bg-violet-50/30",
                ].join(" ")}
              >
                <td className="py-2 pr-3">
                  <button
                    type="button"
                    onClick={() => onSelectForm?.(form.original)}
                    className="focus-kb font-reader text-left font-medium transition hover:text-violet-800"
                  >
                    <span className={isActive ? "text-violet-900" : "text-neutral-800"}>
                      {form.original}
                    </span>
                    {isActive ? (
                      <span className="ml-2 rounded bg-violet-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-violet-900">
                        ici
                      </span>
                    ) : null}
                  </button>
                </td>
                <td className="py-2 pr-3 text-neutral-600">
                  {formatCaseLabelFr(form.case) ?? "—"}
                </td>
                <td className="py-2">
                  {form.ending ? (
                    <button
                      type="button"
                      onClick={() => onSelectForm?.(form.original)}
                      className="focus-kb"
                    >
                      <EndingBadge
                        endingText={form.ending}
                        grammaticalCase={form.case}
                        size="reader"
                      />
                    </button>
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-neutral-400">
        {forms.length} forme{forms.length > 1 ? "s" : ""} · cliquez pour explorer
      </p>
    </div>
  );
}
