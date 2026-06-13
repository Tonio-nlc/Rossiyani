"use client";

import { useEffect, useState } from "react";

import { EndingBadge } from "@/components/analysis/ending-badge";
import { formatCaseLabelFr } from "@/features/grammar";
import { normalizeCaseKey } from "@/lib/grammar/normalize-case-key";

type MorphologyDecompositionProps = {
  lemma: string;
  original: string;
  stem: string;
  ending: string;
  stressMarked: string;
  grammaticalCase?: string | null;
  grammaticalQuestion?: string | null;
  reason?: string | null;
  frenchComparison?: string | null;
  relatedConcepts?: Array<{ id: string; title: string; conceptKey: string }>;
  onSelectConcept?: (conceptKey: string) => void;
  onSelectLemma?: () => void;
  animateKey?: string;
};

/**
 * Animated stem + ending decomposition — ending is the dominant visual element.
 */
export function MorphologyDecomposition({
  lemma,
  original,
  stem,
  ending,
  stressMarked,
  grammaticalCase,
  grammaticalQuestion,
  reason,
  frenchComparison,
  relatedConcepts = [],
  onSelectConcept,
  onSelectLemma,
  animateKey,
}: MorphologyDecompositionProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick((t) => t + 1);
  }, [animateKey, original]);

  const stemDisplay = ending
    ? stressMarked.slice(0, stressMarked.length - ending.length)
    : stressMarked;
  const endingDisplay = ending ? stressMarked.slice(-ending.length) : "";
  const caseLabel = formatCaseLabelFr(grammaticalCase);

  return (
    <div key={`${animateKey}-${tick}`} className="space-y-5">
      <div className="text-center">
        <button
          type="button"
          onClick={onSelectLemma}
          className="focus-kb text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 transition hover:text-violet-600"
        >
          Lemme · {lemma}
        </button>

        <div className="mt-4 flex flex-col items-center">
          <div className="font-reader flex items-baseline justify-center gap-1 sm:gap-2">
            <span
              className="animate-stem-reveal text-3xl font-medium text-neutral-400 sm:text-4xl"
              style={{ animationDelay: "0ms" }}
            >
              {stemDisplay || stem}
            </span>
            {ending ? (
              <span className="animate-ending-pop animate-ending-glow inline-block">
                <EndingBadge
                  endingText={endingDisplay}
                  grammaticalCase={grammaticalCase}
                  size="panel"
                />
              </span>
            ) : (
              <span className="font-reader text-3xl font-bold text-neutral-900 sm:text-4xl">
                {original}
              </span>
            )}
          </div>

          <p className="mt-2 font-reader text-sm text-neutral-500">{original}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/60 px-3 py-3 text-center panel-transition">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Radical
          </p>
          <p className="font-reader mt-1 text-2xl text-neutral-600">{stem}</p>
        </div>
        <div className="rounded-xl border-2 border-violet-300/80 bg-violet-50/70 px-3 py-3 text-center shadow-sm panel-transition">
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
            Terminaison
          </p>
          <p className="mt-1 flex justify-center">
            {ending ? (
              <EndingBadge endingText={ending} grammaticalCase={grammaticalCase} size="panel" />
            ) : (
              <span className="text-neutral-400">—</span>
            )}
          </p>
        </div>
      </div>

      {grammaticalQuestion || caseLabel ? (
        <div className="rounded-xl border border-cyan-200/70 bg-cyan-50/50 px-4 py-3 text-center">
          {caseLabel ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">
              {caseLabel}
            </p>
          ) : null}
          {grammaticalQuestion ? (
            <p className="mt-1 text-sm font-medium text-cyan-950">{grammaticalQuestion}</p>
          ) : null}
        </div>
      ) : null}

      {reason ? (
        <p className="text-center text-sm leading-relaxed text-neutral-700">{reason}</p>
      ) : null}

      {frenchComparison ? (
        <div className="rounded-xl border border-blue-200/70 bg-blue-50/40 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-blue-800">
            Français ↔ Russe
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-800">{frenchComparison}</p>
        </div>
      ) : null}

      {relatedConcepts.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-2">
          {relatedConcepts.map((concept) => (
            <button
              key={concept.id}
              type="button"
              onClick={() => onSelectConcept?.(concept.conceptKey)}
              className="focus-kb rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-medium text-cyan-900 transition hover:border-cyan-400 hover:bg-cyan-50"
            >
              {concept.title}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const CASE_QUESTIONS: Record<string, string> = {
  nominative: "Qui ? Quoi ?",
  genitive: "De qui ? De quoi ?",
  dative: "À qui ? À quoi ?",
  accusative: "Qui ? Quoi ? (complément)",
  instrumental: "Avec qui ? Avec quoi ?",
  prepositional: "Où ? Sur quoi ?",
  locative: "Où ?",
};

export function grammaticalQuestionForCase(rawCase?: string | null): string | null {
  const key = normalizeCaseKey(rawCase);
  return key ? (CASE_QUESTIONS[key] ?? null) : null;
}
