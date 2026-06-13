import { EndingBadge } from "@/components/analysis/ending-badge";
import { formatCaseLabelFr } from "@/features/grammar";
import { POS_LABELS_FR } from "@/features/grammar/pos-marker";
import type { PartOfSpeech } from "@/types";

type MorphologyLadderProps = {
  lemma: string;
  stressMarked: string;
  stem: string;
  ending: string;
  partOfSpeech: PartOfSpeech;
  grammaticalCase?: string | null;
  gender?: string | null;
  number?: string | null;
  contextLabel?: string | null;
};

export function MorphologyLadder({
  lemma,
  stressMarked,
  stem,
  ending,
  partOfSpeech,
  grammaticalCase,
  gender,
  number,
  contextLabel,
}: MorphologyLadderProps) {
  const caseLabel = formatCaseLabelFr(grammaticalCase);
  const morphLine = [caseLabel, gender, number].filter(Boolean).join(" · ");

  const stemDisplay = ending
    ? stressMarked.slice(0, stressMarked.length - ending.length)
    : stressMarked;
  const endingDisplay = ending ? stressMarked.slice(-ending.length) : "";

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-xs uppercase tracking-wide text-neutral-400">Lemme</p>
      <p className="mt-1 text-lg text-neutral-500">{lemma}</p>

      <p className="my-2 text-2xl text-neutral-300" aria-hidden>
        ↓
      </p>

      <p className="text-xs uppercase tracking-wide text-neutral-400">Dans la phrase</p>
      <p className="mt-1 flex items-center justify-center gap-1 text-3xl font-semibold text-neutral-900">
        <span className="text-neutral-400">{stemDisplay}</span>
        {ending ? (
          <EndingBadge endingText={endingDisplay} grammaticalCase={grammaticalCase} size="panel" />
        ) : (
          <span>{stressMarked}</span>
        )}
      </p>

      <div className="mt-4 grid w-full max-w-xs grid-cols-2 gap-2">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase text-neutral-400">Radical</p>
          <p className="mt-1 text-xl text-neutral-600">{stem}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase text-neutral-400">Terminaison</p>
          <p className="mt-1 flex justify-center">
            {ending ? (
              <EndingBadge endingText={ending} grammaticalCase={grammaticalCase} size="panel" />
            ) : (
              <span className="text-xl text-neutral-400">—</span>
            )}
          </p>
        </div>
      </div>

      {morphLine ? (
        <p className="mt-4 rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-800">
          {morphLine}
        </p>
      ) : null}

      <p className="mt-2 text-xs text-neutral-500">{POS_LABELS_FR[partOfSpeech]}</p>

      {contextLabel ? (
        <p className="mt-3 rounded-md border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-sm font-medium text-cyan-900">
          {contextLabel}
        </p>
      ) : null}
    </div>
  );
}
