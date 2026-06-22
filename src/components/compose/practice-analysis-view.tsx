"use client";

import type { ReactNode } from "react";

import {
  ExerciseCard,
  GhostButton,
  PrimaryButton,
} from "@/components/design-system";
import { Reference } from "@/components/editorial";
import type { StructureContext } from "@/features/practice/get-structure-context";
import type { ComposeAnalysis, ComposeAlternative, ComposeVerdict } from "@/lib/compose/types";
import { PRACTICE_REWRITE_PRESETS } from "@/lib/compose/types";

import { PracticeExerciseHeader } from "../practice/practice-exercise-header";

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
  originalSentence: string;
  structureContext?: StructureContext | null;
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

function isSuccessVerdict(verdict: ComposeVerdict): boolean {
  return verdict === "natural" || verdict === "correct";
}

export function PracticeAnalysisView(props: PracticeAnalysisViewProps) {
  const { analysis, originalSentence, structureContext } = props;
  const primaryStructure = analysis.structures[0];
  const structureHref = primaryStructure?.href ?? "/explorer";
  const success = isSuccessVerdict(analysis.verdict);

  return (
    <div className="practice-shell pb-8">
      <PracticeExerciseHeader
        exerciseType="Constructeur de phrases"
        title={VERDICT_TITLE[analysis.verdict]}
        subtitle={analysis.summary}
        sourceTitle={structureContext?.readerTitle ?? null}
        sourceHref={structureContext?.readerHref ?? null}
        meta={<span>{VERDICT_HEADLINE[analysis.verdict]}</span>}
      />

      <div className="practice-exercise-layout">
        <div className="practice-results">
          <section
            className={[
              "practice-result-card",
              success ? "practice-result-card--success" : "practice-result-card--review",
            ].join(" ")}
          >
            <p className="practice-result-card__label">Votre phrase</p>
            <p className="practice-result-card__sentence break-russian font-reader">
              {originalSentence}
            </p>
            {primaryStructure ? (
              <p className="practice-result-card__structure break-russian">
                Structure · {primaryStructure.label}
              </p>
            ) : null}
          </section>

          {analysis.alternatives.length > 0 ? (
            <PracticeSection label="Alternatives natives">
              <ul className="practice-card-list">
                {analysis.alternatives.map((alt) => (
                  <li key={`${alt.register}-${alt.text}`}>
                    <AlternativeCard alternative={alt} />
                  </li>
                ))}
              </ul>
            </PracticeSection>
          ) : null}

          {analysis.linguisticBlocks.length > 0 ? (
            <PracticeSection label="Pourquoi cela fonctionne">
              <ul className="practice-learning-list">
                {analysis.linguisticBlocks.map((block) => {
                  const expanded = props.expandedBlocks[block.id];
                  const truncated = !expanded && block.note.length > 160;
                  const note = expanded ? block.note : block.note.slice(0, 160);

                  return (
                    <li key={block.id}>
                      <div className="practice-learning-card">
                        <p className="practice-learning-card__category">{block.category}</p>
                        <p className="practice-learning-card__text">
                          {note}
                          {truncated ? "…" : ""}
                        </p>
                        {block.note.length > 160 ? (
                          <GhostButton onClick={() => props.onToggleBlock(block.id)}>
                            {expanded ? "Réduire" : "Lire la suite →"}
                          </GhostButton>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </PracticeSection>
          ) : null}

          {analysis.structures.length > 0 ? (
            <PracticeSection label="Structures détectées">
              <ul className="practice-chip-row">
                {analysis.structures.map((structure) => (
                  <li key={structure.href}>
                    <GhostButton href={structure.href}>{structure.label} →</GhostButton>
                  </li>
                ))}
              </ul>
            </PracticeSection>
          ) : null}

          {analysis.relatedExpressions?.length ? (
            <PracticeSection label="Expressions liées">
              <ul className="practice-card-list">
                {analysis.relatedExpressions.map((expression) => (
                  <li key={expression.href}>
                    <ExerciseCard
                      href={expression.href}
                      title={expression.label}
                      footer={
                        <p className="practice-related-note">
                          {expression.reason ?? "Motif connexe à explorer en contexte."}
                        </p>
                      }
                    />
                  </li>
                ))}
              </ul>
            </PracticeSection>
          ) : null}

          <PracticeSection label="Réécriture">
            <ul className="practice-rewrite-list">
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
                      <p className="practice-rewrite-hint">
                        {REWRITE_DESCRIPTIONS[preset.id] ?? preset.instruction}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            {props.openRewriteId && props.rewriteResult?.id === props.openRewriteId ? (
              <div className="practice-learning-card practice-learning-card--rewrite">
                <p className="practice-learning-card__category">
                  {REWRITE_LABELS[props.rewriteResult.id] ?? props.rewriteResult.shortTitle}
                </p>
                <p className="practice-result-card__sentence break-russian font-reader">
                  {props.rewriteResult.text}
                </p>
                <p className="practice-learning-card__text">{props.rewriteResult.explanation}</p>
                <ul className="practice-chip-row">
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
              </div>
            ) : null}
          </PracticeSection>

          <div className="practice-footer-actions">
            <GhostButton href={structureHref}>Explorer la structure →</GhostButton>
            <GhostButton href="/manual">Manuel →</GhostButton>
            <GhostButton disabled={props.saved} onClick={props.onSave}>
              {props.saved ? "Enregistré" : "Enregistrer la phrase →"}
            </GhostButton>
          </div>

          <footer className="practice-footer-submit">
            <PrimaryButton onClick={props.onPracticeAnother}>Nouvelle phrase →</PrimaryButton>
          </footer>
        </div>
      </div>
    </div>
  );
}

function PracticeSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="practice-section">
      <h2 className="practice-section__label">{label}</h2>
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
      className="practice-alt-card"
    />
  );
}
