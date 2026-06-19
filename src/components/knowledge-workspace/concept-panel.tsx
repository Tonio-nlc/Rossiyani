"use client";

import { useEffect, useState } from "react";

import { Tag } from "@/components/design-system";
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
          <span key={i} className="skeleton-shimmer inline-block h-8 w-28" aria-hidden />
        ))}
      </div>
    );
  }

  if (concepts.length === 0) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">
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
            <Tag
              key={concept.id}
              active={isActive}
              onClick={() => onSelectConcept(concept.conceptKey)}
            >
              <span className="block text-left">
                <span className="block font-medium">{concept.title}</span>
                <span className="text-[10px] text-[var(--ink-muted)]">
                  {CATEGORY_LABELS[concept.category]}
                </span>
              </span>
            </Tag>
          );
        })}
      </div>

      {loadingDetail ? (
        <p className="text-sm text-[var(--ink-muted)]">Chargement du concept…</p>
      ) : detailConcept ? (
        <div className="ds-microscope-panel space-y-3">
          <h4 className="font-reader text-base text-[var(--ink)]">{detailConcept.concept.title}</h4>
          <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
            {detailConcept.concept.canonicalExplanation}
          </p>
          {detailConcept.concept.frenchComparison ? (
            <p className="border-t border-[var(--hairline)] pt-3 text-sm text-[var(--ink-secondary)]">
              <span className="text-[var(--ink-muted)]">FR ↔ RU : </span>
              {detailConcept.concept.frenchComparison}
            </p>
          ) : null}

          {detailConcept.relatedConcepts.length > 0 ? (
            <div className="border-t border-[var(--hairline)] pt-3">
              <p className="text-eyebrow mb-2">Concepts liés</p>
              <div className="flex flex-wrap gap-2">
                {detailConcept.relatedConcepts.map((related) => (
                  <Tag key={related.id} onClick={() => onSelectConcept(related.conceptKey)}>
                    {related.title}
                  </Tag>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : activeConceptKey ? null : (
        <p className="text-xs text-[var(--ink-muted)]">
          Cliquez sur un concept pour explorer le graphe pédagogique.
        </p>
      )}
    </div>
  );
}
