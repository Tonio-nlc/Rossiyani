import type { ReactNode } from "react";

import { EndingBadge } from "@/components/analysis/ending-badge";
import { grammaticalQuestionForCase } from "@/components/analysis/morphology-decomposition";
import { formatCaseLabelFr } from "@/features/grammar";
import type { WordDetailGraph } from "@/types/word-detail-graph";

type MorphologyTimelineProps = {
  detail: WordDetailGraph;
  previousWord?: { original: string; partOfSpeech: string } | null;
};

function TimelineChip({
  label,
  children,
  highlight,
  delay,
}: {
  label: string;
  children: ReactNode;
  highlight?: boolean;
  delay: number;
}) {
  return (
    <div
      className="microscope-timeline-step animate-microscope-slide flex shrink-0 flex-col items-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
      <div
        className={[
          "mt-0.5 rounded-lg border px-2 py-1 text-center transition",
          highlight
            ? "border-[var(--accent-violet)]/45 bg-[var(--accent-violet)]/10 shadow-[0_0_12px_rgba(124,58,237,0.12)]"
            : "border-[var(--border)] bg-[var(--surface)]",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

function TimelineArrow({ delay }: { delay: number }) {
  return (
    <span
      className="shrink-0 px-0.5 text-sm text-[var(--accent-violet-bright)]/70 animate-microscope-slide"
      style={{ animationDelay: `${delay}ms` }}
      aria-hidden
    >
      →
    </span>
  );
}

function WhyPanel({
  detail,
  delay,
}: {
  detail: WordDetailGraph;
  delay: number;
}) {
  const { occurrence } = detail;

  return (
    <div
      className="animate-microscope-slide rounded-lg border border-[var(--accent-violet)]/35 bg-[var(--accent-violet)]/8 px-3 py-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
        Pourquoi ?
      </p>
      <p className="mt-0.5 font-reader text-base font-bold text-[var(--accent-violet-bright)]">
        {occurrence.original}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-[var(--muted)]">
        {detail.grammaticalReason || detail.canonicalExplanation}
      </p>
    </div>
  );
}

export function MorphologyTimeline({ detail, previousWord }: MorphologyTimelineProps) {
  const { occurrence } = detail;
  const question = grammaticalQuestionForCase(occurrence.case);
  const caseLabel = formatCaseLabelFr(occurrence.case);
  const preposition =
    previousWord?.partOfSpeech === "preposition" ? previousWord.original : null;
  const hasMorphology = Boolean(question || preposition || caseLabel || occurrence.ending);

  let delay = 0;

  if (!hasMorphology) {
    return <WhyPanel detail={detail} delay={0} />;
  }

  const steps: Array<{ key: string; node: ReactNode; arrowAfter: boolean }> = [];

  if (question) {
    steps.push({
      key: "question",
      node: (
        <TimelineChip label="Question" delay={delay}>
          <p className="font-reader text-sm font-semibold text-[var(--foreground)]">{question}</p>
        </TimelineChip>
      ),
      arrowAfter: true,
    });
    delay += 60;
  }

  if (preposition) {
    steps.push({
      key: "prep",
      node: (
        <TimelineChip label="Préposition" delay={delay}>
          <p className="font-reader text-base font-bold text-[var(--accent-cyan-bright)]">
            {preposition}
          </p>
        </TimelineChip>
      ),
      arrowAfter: true,
    });
    delay += 60;
  }

  if (caseLabel) {
    steps.push({
      key: "case",
      node: (
        <TimelineChip label="Cas" delay={delay}>
          <p className="text-sm font-semibold text-[var(--foreground)]">{caseLabel}</p>
        </TimelineChip>
      ),
      arrowAfter: true,
    });
    delay += 60;
  }

  if (occurrence.ending) {
    steps.push({
      key: "ending",
      node: (
        <TimelineChip label="Terminaison" highlight delay={delay}>
          <EndingBadge
            endingText={occurrence.ending}
            grammaticalCase={occurrence.case}
            size="reader"
          />
        </TimelineChip>
      ),
      arrowAfter: false,
    });
    delay += 60;
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(200px,260px)] lg:items-start">
      <div className="overflow-x-auto pb-0.5">
        <div className="flex min-w-min flex-row flex-wrap items-center gap-1 px-0.5 sm:flex-nowrap">
          {steps.map((step) => (
            <div key={step.key} className="flex items-center gap-1">
              {step.node}
              {step.arrowAfter ? <TimelineArrow delay={delay} /> : null}
            </div>
          ))}
        </div>
      </div>

      <WhyPanel detail={detail} delay={delay} />
    </div>
  );
}
