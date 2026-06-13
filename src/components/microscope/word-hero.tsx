import { EndingBadge } from "@/components/analysis/ending-badge";
import type { WordDetailGraph } from "@/types/word-detail-graph";

type WordHeroProps = {
  detail: WordDetailGraph;
};

export function WordHero({ detail }: WordHeroProps) {
  const { occurrence } = detail;
  const stemDisplay = occurrence.stem || occurrence.original;
  const endingDisplay = occurrence.ending;

  return (
    <div className="microscope-hero text-center">
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
        Mot actuel
      </p>
      <p
        className="mt-0.5 font-reader text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl"
        data-shared-element="word-hero"
      >
        {occurrence.stressMarked}
      </p>

      <p className="mt-1 font-reader text-sm text-[var(--muted)] sm:text-base">
        {occurrence.lemma}
        <span className="mx-1.5 text-[var(--border-strong)]">·</span>
        <span className="text-xs uppercase tracking-wide">{occurrence.partOfSpeech}</span>
      </p>

      <div className="mx-auto mt-3 h-px w-12 bg-gradient-to-r from-transparent via-[var(--accent-violet)]/35 to-transparent" />

      <div className="mt-3 flex flex-wrap items-baseline justify-center gap-1">
        {endingDisplay ? (
          <>
            <span className="font-reader text-lg text-[var(--muted)]/60 sm:text-xl">{stemDisplay}</span>
            <span className="text-base font-light text-[var(--border-strong)] sm:text-lg">+</span>
            <span className="animate-ending-pop animate-ending-glow inline-block">
              <EndingBadge
                endingText={endingDisplay}
                grammaticalCase={occurrence.case}
                size="reader"
              />
            </span>
          </>
        ) : (
          <span className="font-reader text-xl text-[var(--foreground)] sm:text-2xl">
            {occurrence.original}
          </span>
        )}
      </div>
    </div>
  );
}
