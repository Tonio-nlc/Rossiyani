import { EndingBadge } from "@/components/analysis/ending-badge";
import { PosMarker } from "@/components/analysis/pos-marker";
import { formatCaseLabelFr } from "@/features/grammar";
import type { WordDetailGraph } from "@/types/word-detail-graph";

type WordIdentityPanelProps = {
  detail: WordDetailGraph;
};

export function WordIdentityPanel({ detail }: WordIdentityPanelProps) {
  const { occurrence, contextLabel, statistics } = detail;
  const caseLabel = formatCaseLabelFr(occurrence.case);
  const morphLine = [caseLabel, occurrence.gender, occurrence.number, occurrence.tense, occurrence.aspect]
    .filter(Boolean)
    .join(" · ");

  const stemDisplay = occurrence.ending
    ? occurrence.stressMarked.slice(0, occurrence.stressMarked.length - occurrence.ending.length)
    : occurrence.stressMarked;
  const endingDisplay = occurrence.ending
    ? occurrence.stressMarked.slice(-occurrence.ending.length)
    : "";

  return (
    <div className="flex h-full flex-col justify-between animate-shared-enter">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
            Lemme
          </p>
          <p className="mt-0.5 text-lg text-neutral-500">{occurrence.lemma}</p>
        </div>
        <PosMarker partOfSpeech={occurrence.partOfSpeech} />
      </div>

      <div className="my-4 flex flex-col items-center text-center">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
          Forme dans le texte
        </p>
        <p
          className="mt-2 flex flex-wrap items-center justify-center gap-0.5 text-4xl font-bold leading-none text-neutral-900 sm:text-5xl"
          data-shared-element="word-form"
        >
          <span className="font-medium text-neutral-400">{stemDisplay}</span>
          {occurrence.ending ? (
            <EndingBadge
              endingText={endingDisplay}
              grammaticalCase={occurrence.case}
              size="panel"
            />
          ) : (
            <span>{occurrence.stressMarked}</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/80 px-3 py-2.5 text-center">
          <p className="text-[10px] font-bold uppercase text-neutral-400">Radical</p>
          <p className="mt-1 text-xl font-medium text-neutral-700">{occurrence.stem}</p>
        </div>
        <div className="rounded-lg border-2 border-violet-200 bg-violet-50/50 px-3 py-2.5 text-center">
          <p className="text-[10px] font-bold uppercase text-violet-600">Terminaison</p>
          <p className="mt-1 flex justify-center">
            {occurrence.ending ? (
              <EndingBadge
                endingText={occurrence.ending}
                grammaticalCase={occurrence.case}
                size="panel"
              />
            ) : (
              <span className="text-xl text-neutral-400">—</span>
            )}
          </p>
        </div>
      </div>

      {morphLine ? (
        <p className="mt-3 text-center text-sm font-medium text-neutral-700">{morphLine}</p>
      ) : null}

      {contextLabel ? (
        <p className="mt-2 rounded-md border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-center text-sm font-medium text-cyan-900">
          {contextLabel}
        </p>
      ) : null}

      {statistics.libraryHitCount !== null && statistics.libraryHitCount > 1 ? (
        <p className="mt-3 text-center text-xs text-neutral-500">
          Vu{" "}
          <span className="font-semibold text-neutral-800">{statistics.libraryHitCount}</span> fois
          dans la bibliothèque
        </p>
      ) : null}
    </div>
  );
}
