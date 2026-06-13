"use client";

import { useEffect, useState } from "react";

import type { ConceptKnowledge, GraphConceptSummary } from "@/types/knowledge-graph";
import type { WordDetailGraph } from "@/types/word-detail-graph";
import type { WordDetailSection } from "@/types/word-detail-graph";

type ConceptPanelProps = {
  detail: WordDetailGraph;
  activeConceptKey: string | null;
  onSelectConcept: (conceptKey: string) => void;
  loadingSections?: WordDetailSection[];
};

const CATEGORY_LABELS: Record<GraphConceptSummary["category"], string> = {
  GRAMMATICAL_CASE: "Cas",
  GRAMMAR_PATTERN: "Grammaire",
  PREPOSITION_PATTERN: "Préposition",
  CONSTRUCTION: "Construction",
  SEMANTIC: "Sémantique",
  OTHER: "Autre",
};

export function ConceptPanel({
  detail,
  activeConceptKey,
  onSelectConcept,
  loadingSections = [],
}: ConceptPanelProps) {
  const [detailConcept, setDetailConcept] = useState<ConceptKnowledge | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const concepts = detail.concepts;
  const loadingConcepts = loadingSections.includes("concepts");

  useEffect(() => {
    if (!activeConceptKey) {
      setDetailConcept(null);
      return;
    }

    let cancelled = false;
    setLoadingDetail(true);

    void fetch(`/api/knowledge/concept?key=${encodeURIComponent(activeConceptKey)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { concept: ConceptKnowledge } | null) => {
        if (!cancelled) {
          setDetailConcept(data?.concept ?? null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingDetail(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeConceptKey]);

  if (loadingConcepts) {
    return (
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <span key={i} className="inline-block h-8 w-28 animate-pulse rounded-full bg-neutral-100" />
        ))}
      </div>
    );
  }

  if (concepts.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Aucun concept lié pour l&apos;instant. Les imports enrichissent progressivement le graphe.
      </p>
    );
  }

  return (
    <div className="space-y-4 animate-shared-enter" style={{ animationDelay: "240ms" }}>
      <div className="flex flex-wrap gap-2">
        {concepts.map((concept) => {
          const isActive = concept.conceptKey === activeConceptKey;
          return (
            <button
              key={concept.id}
              type="button"
              onClick={() => onSelectConcept(concept.conceptKey)}
              className={[
                "rounded-full border px-3 py-1.5 text-left text-xs transition panel-transition",
                isActive
                  ? "border-cyan-500 bg-cyan-50 font-semibold text-cyan-900 shadow-sm"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-cyan-300 hover:bg-cyan-50/50",
              ].join(" ")}
            >
              <span className="block font-medium">{concept.title}</span>
              <span className="text-[10px] text-neutral-500">
                {CATEGORY_LABELS[concept.category]}
              </span>
            </button>
          );
        })}
      </div>

      {loadingDetail ? (
        <p className="text-sm text-neutral-400">Chargement du concept…</p>
      ) : detailConcept ? (
        <div className="rounded-lg border border-cyan-200/80 bg-cyan-50/30 p-4">
          <h4 className="text-sm font-bold text-cyan-950">{detailConcept.concept.title}</h4>
          <p className="mt-2 text-sm leading-relaxed text-neutral-800">
            {detailConcept.concept.canonicalExplanation}
          </p>
          {detailConcept.concept.frenchComparison ? (
            <p className="mt-3 border-t border-cyan-200/60 pt-3 text-sm text-neutral-700">
              <span className="font-medium text-neutral-500">FR ↔ RU : </span>
              {detailConcept.concept.frenchComparison}
            </p>
          ) : null}

          {detailConcept.relatedConcepts.length > 0 ? (
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase text-neutral-400">Concepts liés</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {detailConcept.relatedConcepts.map((related) => (
                  <button
                    key={related.id}
                    type="button"
                    onClick={() => onSelectConcept(related.conceptKey)}
                    className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 hover:border-cyan-300"
                  >
                    {related.title}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : activeConceptKey ? null : (
        <p className="text-xs text-neutral-400">
          Cliquez sur un concept pour explorer le graphe pédagogique.
        </p>
      )}
    </div>
  );
}
