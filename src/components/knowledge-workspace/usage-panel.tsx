import type { WordDetailGraph } from "@/types/word-detail-graph";
import { PHRASE_GROUP_TYPE_LABELS } from "@/types";
import type { PhraseGroupType } from "@/types";
import type { WordDetailSection } from "@/types/word-detail-graph";

type UsagePanelProps = {
  detail: WordDetailGraph;
  onShowExamples?: () => void;
  loadingSections?: WordDetailSection[];
};

export function UsagePanel({ detail, onShowExamples, loadingSections = [] }: UsagePanelProps) {
  const loadingStats = loadingSections.includes("statistics");
  const loadingCollocations = loadingSections.includes("collocations");
  const loadingExamples = loadingSections.includes("examples");

  const { statistics, phraseKnowledge, phraseOccurrence, examples } = detail;

  return (
    <div className="space-y-4 animate-shared-enter" style={{ animationDelay: "180ms" }}>
      <div className="flex flex-wrap gap-2">
        {loadingStats ? (
          <>
            <SkeletonChip />
            <SkeletonChip />
          </>
        ) : (
          <>
            {statistics.occurrenceCount > 0 ? (
              <StatChip label="Occurrences" value={String(statistics.occurrenceCount)} />
            ) : null}
            {statistics.seenInTexts > 0 ? (
              <StatChip label="Textes" value={String(statistics.seenInTexts)} />
            ) : null}
            {statistics.collocationCount !== null && statistics.collocationCount > 0 ? (
              <StatChip label="Collocation" value={String(statistics.collocationCount)} />
            ) : null}
          </>
        )}
      </div>

      {loadingCollocations ? (
        <div className="h-20 animate-pulse rounded-lg bg-neutral-100" />
      ) : phraseKnowledge || phraseOccurrence ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-3">
          <p className="text-[10px] font-bold uppercase text-neutral-400">Construction / groupe</p>
          <p className="mt-1 font-medium text-neutral-900">
            {phraseKnowledge?.label ?? phraseOccurrence?.label}
          </p>
          <p className="text-xs text-neutral-500">
            {PHRASE_GROUP_TYPE_LABELS[
              (phraseKnowledge?.type ?? phraseOccurrence?.type) as PhraseGroupType
            ]}
          </p>
          <p className="mt-2 text-sm text-neutral-700">
            {phraseKnowledge?.canonicalExplanation ?? phraseOccurrence?.explanation}
          </p>
        </div>
      ) : null}

      {loadingExamples ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-neutral-100" />
          ))}
        </div>
      ) : examples.length > 0 ? (
        <div>
          <button
            type="button"
            onClick={onShowExamples}
            className="focus-kb text-[10px] font-bold uppercase text-neutral-400 transition hover:text-violet-700"
          >
            Exemples réels ({examples.length})
          </button>
          <ul className="mt-2 space-y-2">
            {examples.slice(0, 6).map((sentence) => (
              <li
                key={sentence}
                className="rounded-md border border-neutral-100 bg-neutral-50/80 px-3 py-2 text-sm text-neutral-800"
              >
                {sentence}
              </li>
            ))}
          </ul>
        </div>
      ) : !loadingExamples ? (
        <p className="text-sm text-neutral-500">
          Les exemples s&apos;accumulent à chaque import de texte contenant ce lemme.
        </p>
      ) : null}
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs">
      <span className="font-semibold text-neutral-900">{value}</span>
      <span className="text-neutral-500">{label}</span>
    </span>
  );
}

function SkeletonChip() {
  return <span className="inline-block h-7 w-24 animate-pulse rounded-full bg-neutral-100" />;
}
