"use client";

import type { WordDetailGraph } from "@/types/word-detail-graph";
import type { WordDetailSection } from "@/types/word-detail-graph";

import { Skeleton } from "@/components/ui/skeleton";

import { WordAnalysisCard } from "./word-analysis-card";
import type { GrammarCardContext } from "@/lib/formatting/grammar-card-fields";

type LinguisticMicroscopeProps = {
  detail: WordDetailGraph | null;
  loading: boolean;
  loadingSections?: WordDetailSection[];
  error: string | null;
  previousWord?: { original: string; partOfSpeech: string } | null;
  onSelectForm?: (original: string) => void;
  grammarContext?: GrammarCardContext;
  analysisComplete?: boolean;
  isUnrecognizedWord?: boolean;
};

export function LinguisticMicroscope({
  detail,
  loading,
  loadingSections = [],
  error,
  grammarContext,
  analysisComplete = true,
  isUnrecognizedWord = false,
}: LinguisticMicroscopeProps) {
  if (loading && !detail) {
    return (
      <div className="microscope-panel border-t border-[var(--border)] px-4 py-4 sm:px-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-36 w-full rounded-xl" />
        <p className="mt-2 text-xs text-[var(--muted)]">Analyse en cours…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="microscope-panel border-t border-[var(--error)]/30 bg-red-950/15 px-4 py-6 text-center sm:px-6">
        <p className="text-sm text-[var(--error)]">{error}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">Sélectionnez un autre mot.</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="microscope-panel border-t border-[var(--border)] px-4 py-8 text-center sm:px-6">
        <p className="text-sm text-[var(--muted)]">
          Cliquez sur un mot pour voir forme, lemme, cas et traduction.
        </p>
        <p className="mt-1.5 text-[10px] text-[var(--muted)]/70">
          ← → mots · ↑ ↓ phrases · / recherche · Échap
        </p>
      </div>
    );
  }

  const enrichmentLoading = loadingSections.length > 0;

  return (
    <section
      className="microscope-panel max-h-[550px] border-t border-[var(--border)]"
      aria-label="Microscope linguistique"
    >
      <div className="px-4 py-3 sm:px-6">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent-violet-bright)]">
            Analyse
          </p>
          {enrichmentLoading ? (
            <span className="text-[10px] text-[var(--accent-cyan)] animate-pulse">
              Enrichissement…
            </span>
          ) : null}
        </div>

        <WordAnalysisCard
          detail={detail}
          context={grammarContext}
          analysisComplete={analysisComplete}
          isUnrecognizedWord={isUnrecognizedWord}
        />
      </div>
    </section>
  );
}
