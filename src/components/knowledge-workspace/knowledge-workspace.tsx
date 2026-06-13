"use client";

import { useCallback, useMemo, useState } from "react";

import {
  grammaticalQuestionForCase,
  MorphologyDecomposition,
} from "@/components/analysis/morphology-decomposition";
import type { WordDetailGraph } from "@/types/word-detail-graph";
import type { WordDetailSection } from "@/types/word-detail-graph";

import { ConceptPanel } from "./concept-panel";
import { KnowledgeBreadcrumb, type KnowledgeNavStep } from "./knowledge-navigation";
import { ParadigmPanel } from "./paradigm-panel";
import { RelatedTextsPanel } from "./related-texts-panel";
import { UsagePanel } from "./usage-panel";
import { WhyThisFormPanel } from "./why-this-form-panel";
import { WordIdentityPanel } from "./word-identity-panel";
import { WorkspacePanel } from "./workspace-panel";

type KnowledgeWorkspaceProps = {
  detail: WordDetailGraph | null;
  loading: boolean;
  loadingSections?: WordDetailSection[];
  error: string | null;
  currentTextId: string;
  onSelectLemma?: (lemma: string) => void;
  onSelectFormInText?: (original: string) => void;
};

export function KnowledgeWorkspace({
  detail,
  loading,
  loadingSections = [],
  error,
  currentTextId,
  onSelectLemma,
  onSelectFormInText,
}: KnowledgeWorkspaceProps) {
  const [activeConceptKey, setActiveConceptKey] = useState<string | null>(null);
  const [navFocus, setNavFocus] = useState<"word" | "lemma" | "concept" | "examples" | "related">(
    "word",
  );

  const handleSelectConcept = useCallback((key: string) => {
    setActiveConceptKey(key);
    setNavFocus("concept");
  }, []);

  const breadcrumbSteps = useMemo((): KnowledgeNavStep[] => {
    if (!detail) {
      return [{ type: "text" }];
    }
    const steps: KnowledgeNavStep[] = [
      { type: "text" },
      { type: "word", label: detail.occurrence.original },
      { type: "lemma", label: detail.occurrence.lemma },
    ];
    if (navFocus === "concept" && activeConceptKey) {
      const concept = detail.concepts.find((c) => c.conceptKey === activeConceptKey);
      if (concept) {
        steps.push({ type: "concept", label: concept.title, conceptKey: concept.conceptKey });
      }
    }
    if (navFocus === "examples") {
      steps.push({ type: "examples" });
    }
    if (navFocus === "related") {
      steps.push({ type: "related-texts" });
    }
    return steps;
  }, [detail, navFocus, activeConceptKey]);

  const handleBreadcrumbNavigate = useCallback(
    (index: number) => {
      const step = breadcrumbSteps[index];
      if (!step) {
        return;
      }
      if (step.type === "text" || step.type === "word") {
        setNavFocus("word");
        setActiveConceptKey(null);
      } else if (step.type === "lemma") {
        setNavFocus("lemma");
        setActiveConceptKey(null);
        onSelectLemma?.(detail!.occurrence.lemma);
      } else if (step.type === "concept") {
        setNavFocus("concept");
        setActiveConceptKey(step.conceptKey);
      } else if (step.type === "examples") {
        setNavFocus("examples");
      } else if (step.type === "related-texts") {
        setNavFocus("related");
      }
    },
    [breadcrumbSteps, onSelectLemma, detail],
  );

  if (loading && !detail) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-violet-200/60 bg-white/60 p-8 backdrop-blur-sm">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-violet-200" />
          <p className="mt-3 text-sm text-neutral-500">Chargement depuis la base…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {error}
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-gradient-to-b from-white to-neutral-50/80 p-8 text-center">
        <div className="max-w-md space-y-2">
          <p className="text-sm font-medium text-neutral-700">Microscope linguistique</p>
          <p className="text-sm leading-relaxed text-neutral-500">
            Cliquez sur un mot — ou utilisez les flèches ← → pour naviguer. Terminaison, lemme,
            concepts et exemples réels fusionnés ici.
          </p>
          <p className="text-xs text-neutral-400">Raccourci recherche : /</p>
        </div>
      </div>
    );
  }

  const frenchComparison =
    detail.frenchComparisonCanonical ?? detail.frenchComparison?.whyDifferent ?? null;

  const enrichmentLoading = loadingSections.length > 0;

  return (
    <div
      key={detail.wordId}
      className="animate-microscope-in overflow-hidden rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-white via-white to-violet-50/40 shadow-lg shadow-violet-900/5"
    >
      <div className="border-b border-neutral-800/10 bg-neutral-900 px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-500">
            Microscope linguistique
          </p>
          {enrichmentLoading ? (
            <span className="text-[10px] text-violet-400 animate-pulse">Enrichissement…</span>
          ) : null}
        </div>
        <div className="mt-2">
          <KnowledgeBreadcrumb steps={breadcrumbSteps} onNavigate={handleBreadcrumbNavigate} />
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:gap-4 sm:p-4 lg:grid-cols-12">
        <WorkspacePanel
          title="Identité"
          subtitle="Forme · lemme · terminaison"
          accent="ending"
          className="lg:col-span-5"
        >
          <WordIdentityPanel detail={detail} />
        </WorkspacePanel>

        <WorkspacePanel
          title="Décomposition animée"
          subtitle="Radical + terminaison"
          accent="ending"
          className="lg:col-span-7"
        >
          <MorphologyDecomposition
            animateKey={detail.occurrence.original}
            lemma={detail.occurrence.lemma}
            original={detail.occurrence.original}
            stem={detail.occurrence.stem}
            ending={detail.occurrence.ending}
            stressMarked={detail.occurrence.stressMarked}
            grammaticalCase={detail.occurrence.case}
            grammaticalQuestion={grammaticalQuestionForCase(detail.occurrence.case)}
            reason={detail.grammaticalReason}
            frenchComparison={frenchComparison}
            relatedConcepts={detail.concepts}
            onSelectConcept={handleSelectConcept}
            onSelectLemma={() => {
              setNavFocus("lemma");
              onSelectLemma?.(detail.occurrence.lemma);
            }}
          />
        </WorkspacePanel>

        <WorkspacePanel
          title="Pourquoi cette forme"
          subtitle="Canon · grammaire · français"
          accent="usage"
          className="lg:col-span-12"
        >
          <WhyThisFormPanel detail={detail} />
        </WorkspacePanel>

        {(navFocus === "word" || navFocus === "lemma") && (
          <>
            <WorkspacePanel
              title="Paradigme"
              subtitle="Formes connues — cliquez une forme"
              className="lg:col-span-5 panel-transition"
            >
              <ParadigmPanel
                detail={detail}
                onSelectForm={onSelectFormInText}
                loading={loadingSections.includes("statistics")}
              />
            </WorkspacePanel>

            <WorkspacePanel
              title="Usage"
              subtitle="Fréquence · collocations · exemples"
              accent="usage"
              className="lg:col-span-7 panel-transition"
            >
              <UsagePanel
                detail={detail}
                onShowExamples={() => setNavFocus("examples")}
                loadingSections={loadingSections}
              />
            </WorkspacePanel>
          </>
        )}

        <WorkspacePanel
          title="Concepts"
          subtitle="Navigation dans le graphe"
          accent="concept"
          className="lg:col-span-12"
        >
          <ConceptPanel
            detail={detail}
            activeConceptKey={activeConceptKey}
            onSelectConcept={handleSelectConcept}
            loadingSections={loadingSections}
          />
        </WorkspacePanel>

        <WorkspacePanel
          title="Textes liés"
          subtitle="Autres occurrences importées"
          className="lg:col-span-12"
        >
          <RelatedTextsPanel
            detail={detail}
            currentTextId={currentTextId}
            loadingSections={loadingSections}
          />
        </WorkspacePanel>
      </div>
    </div>
  );
}
