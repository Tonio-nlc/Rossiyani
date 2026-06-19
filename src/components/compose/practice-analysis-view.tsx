"use client";

import type { ReactNode } from "react";

import {
  ExerciseCard,
  GhostButton,
  PracticeMarginNote,
  PrimaryButton,
  SectionHeader,
} from "@/components/design-system";
import { Reference } from "@/components/editorial";
import type { ComposeAnalysis, ComposeAlternative, ComposeVerdict } from "@/lib/compose/types";
import { PRACTICE_REWRITE_PRESETS } from "@/lib/compose/types";

type RewriteResult = {
  id: string;
  shortTitle: string;
  text: string;
  explanation: string;
};

const VERDICT_TITLE: Record<ComposeVerdict, string> = {
  natural: "Naturel",
  correct: "Correct",
  unusual: "Inhabituel",
  needs_correction: "À corriger",
};

const VERDICT_HEADLINE: Record<ComposeVerdict, string> = {
  natural: "Phrase acceptée",
  correct: "Phrase acceptée",
  unusual: "Compréhensible, mais inhabituelle",
  needs_correction: "Correction nécessaire",
};

const REWRITE_LABELS: Record<string, string> = {
  natural: "Plus naturel",
  conversational: "Plus conversationnel",
  literary: "Plus littéraire",
  different: "Autrement",
};

const REWRITE_DESCRIPTIONS: Record<string, string> = {
  natural: "Comme un locuteur natif cultivé.",
  conversational: "Russe parlé du quotidien.",
  literary: "Style écrit et formel.",
  different: "Autre construction, même sens.",
};

type PracticeAnalysisViewProps = {
  analysis: ComposeAnalysis;
  expandedBlocks: Record<string, boolean>;
  onToggleBlock: (id: string) => void;
  onRewrite: (presetId: string, instruction: string, shortTitle: string) => Promise<void>;
  rewriting: string | null;
  openRewriteId: string | null;
  rewriteResult: RewriteResult | null;
  rewriteSaved: boolean;
  saved: boolean;
  onSave: () => void;
  onSaveRewrite: (text: string) => void;
  onPracticeAgain: (text: string) => void;
  onPracticeAnother: () => void;
};

export function PracticeAnalysisView(props: PracticeAnalysisViewProps) {
  const { analysis } = props;
  const primaryStructure = analysis.structures[0];
  const structureHref = primaryStructure?.href ?? "/explorer";

  return (
    <div className="pb-8">
      <header className="editorial-page-section pb-0">
        <SectionHeader
          eyebrow="Pratique"
          title={VERDICT_TITLE[analysis.verdict]}
          description={analysis.summary}
          meta={VERDICT_HEADLINE[analysis.verdict]}
        />
      </header>

      {analysis.alternatives.length > 0 ? (
        <MarginSection eyebrow="Alternatives natives">
          <ul className="space-y-3">
            {analysis.alternatives.map((alt) => (
              <li key={`${alt.register}-${alt.text}`}>
                <AlternativeCard alternative={alt} />
              </li>
            ))}
          </ul>
        </MarginSection>
      ) : null}

      {analysis.linguisticBlocks.length > 0 ? (
        <MarginSection eyebrow="Pourquoi cela fonctionne">
          <ul className="space-y-4">
            {analysis.linguisticBlocks.map((block) => {
              const expanded = props.expandedBlocks[block.id];
              const truncated = !expanded && block.note.length > 160;
              const note = expanded ? block.note : block.note.slice(0, 160);

              return (
                <li key={block.id}>
                  <PracticeMarginNote>
                    <p className="text-sm text-[var(--ink)]">{block.category}</p>
                    <p className="mt-2 leading-relaxed">
                      {note}
                      {truncated ? "…" : ""}
                    </p>
                    {block.note.length > 160 ? (
                      <GhostButton onClick={() => props.onToggleBlock(block.id)}>
                        {expanded ? "Réduire" : "Lire la suite →"}
                      </GhostButton>
                    ) : null}
                  </PracticeMarginNote>
                </li>
              );
            })}
          </ul>
        </MarginSection>
      ) : null}

      {analysis.structures.length > 0 ? (
        <MarginSection eyebrow="Structures détectées">
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {analysis.structures.map((structure) => (
              <li key={structure.href}>
                <GhostButton href={structure.href}>{structure.label} →</GhostButton>
              </li>
            ))}
          </ul>
        </MarginSection>
      ) : null}

      {analysis.relatedExpressions?.length ? (
        <MarginSection eyebrow="Expressions liées">
          <ul className="space-y-3">
            {analysis.relatedExpressions.map((expression) => (
              <li key={expression.href}>
                <ExerciseCard
                  href={expression.href}
                  title={expression.label}
                  footer={
                    <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
                      {expression.reason ?? "Motif connexe à explorer en contexte."}
                    </p>
                  }
                />
              </li>
            ))}
          </ul>
        </MarginSection>
      ) : null}

      <MarginSection eyebrow="Réécriture">
        <ul className="space-y-2">
          {PRACTICE_REWRITE_PRESETS.map((preset) => {
            const isOpen = props.openRewriteId === preset.id;
            const isLoading = props.rewriting === preset.id;

            return (
              <li key={preset.id}>
                <GhostButton
                  disabled={props.rewriting !== null && !isLoading}
                  onClick={() =>
                    void props.onRewrite(preset.id, preset.instruction, preset.shortTitle)
                  }
                >
                  {isLoading
                    ? "Réécriture…"
                    : isOpen
                      ? `${REWRITE_LABELS[preset.id] ?? preset.shortTitle} — fermer`
                      : `${REWRITE_LABELS[preset.id] ?? preset.shortTitle} →`}
                </GhostButton>
                {isOpen ? (
                  <p className="mt-1 text-xs text-[var(--ink-muted)]">
                    {REWRITE_DESCRIPTIONS[preset.id] ?? preset.instruction}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>

        {props.openRewriteId && props.rewriteResult?.id === props.openRewriteId ? (
          <div className="mt-4">
            <ExerciseCard
              eyebrow={REWRITE_LABELS[props.rewriteResult.id] ?? props.rewriteResult.shortTitle}
              title={props.rewriteResult.text}
              footer={
                <>
                  <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
                    {props.rewriteResult.explanation}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                    <li>
                      <GhostButton
                        onClick={() =>
                          void navigator.clipboard.writeText(props.rewriteResult!.text)
                        }
                      >
                        Copier
                      </GhostButton>
                    </li>
                    <li>
                      <GhostButton
                        disabled={props.rewriteSaved}
                        onClick={() => props.onSaveRewrite(props.rewriteResult!.text)}
                      >
                        {props.rewriteSaved ? "Enregistré" : "Enregistrer"}
                      </GhostButton>
                    </li>
                    <li>
                      <Reference
                        href={
                          primaryStructure?.href ??
                          `/explorer?q=${encodeURIComponent(props.rewriteResult.text)}`
                        }
                      >
                        Explorer →
                      </Reference>
                    </li>
                    <li>
                      <GhostButton
                        onClick={() => props.onPracticeAgain(props.rewriteResult!.text)}
                      >
                        Réessayer avec cette phrase →
                      </GhostButton>
                    </li>
                  </ul>
                </>
              }
            />
          </div>
        ) : null}
      </MarginSection>

      <section className="editorial-page-section pb-0">
        <PracticeMarginNote>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            <li>
              <GhostButton href={structureHref}>Explorer la structure →</GhostButton>
            </li>
            <li>
              <GhostButton href="/manual">Manuel →</GhostButton>
            </li>
            <li>
              <GhostButton disabled={props.saved} onClick={props.onSave}>
                {props.saved ? "Enregistré" : "Enregistrer la phrase →"}
              </GhostButton>
            </li>
          </ul>
        </PracticeMarginNote>
      </section>

      <footer className="editorial-page-section flex justify-end border-t border-[var(--hairline)] pt-6">
        <PrimaryButton onClick={props.onPracticeAnother}>Nouvelle phrase →</PrimaryButton>
      </footer>
    </div>
  );
}

function MarginSection({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <section className="editorial-page-section pb-0">
      <p className="text-eyebrow mb-4">{eyebrow}</p>
      {children}
    </section>
  );
}

const REGISTER_LABELS: Record<string, string> = {
  casual: "Familier",
  neutral: "Neutre",
  formal: "Formel",
  informal: "Informel",
  spoken: "Parlé",
  literary: "Littéraire",
};

function AlternativeCard({ alternative }: { alternative: ComposeAlternative }) {
  return (
    <ExerciseCard
      eyebrow={REGISTER_LABELS[alternative.register] ?? alternative.register}
      title={alternative.text}
    />
  );
}
