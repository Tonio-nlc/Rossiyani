"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";

import { ExerciseCard, GhostButton, PrimaryButton } from "@/components/design-system";
import { Reference as EditorialReference } from "@/components/editorial";
import type { ComposeAnalysis, ComposeMode, ComposeVerdict } from "@/lib/compose/types";
import { COMPOSE_VERDICT_LABELS } from "@/lib/compose/types";
import { composeModeLabel } from "@/lib/compose/modes";
import { composePath } from "@/lib/compose/paths";
import { getSavedReaderWords } from "@/lib/reader/saved-words";
import {
  enqueueVocabularyReview,
  isVocabularyInReview,
} from "@/lib/review/review-actions";

type ComposeAnalysisViewProps = {
  mode: ComposeMode;
  analysis: ComposeAnalysis;
  originalSentence: string;
  frenchPrompt?: string | null;
  referenceRussian?: string | null;
  textId?: string | null;
  textTitle?: string | null;
  onPracticeAgain: () => void;
  onPracticeAnother: () => void;
};

const VERDICT_TONE: Record<ComposeVerdict, "success" | "review"> = {
  natural: "success",
  correct: "success",
  unusual: "review",
  needs_correction: "review",
};

const SECTION_ORDER = [
  "overview",
  "corrections",
  "explanations",
  "alternatives",
  "reuse",
] as const;

type SectionId = (typeof SECTION_ORDER)[number];

const SECTION_LABELS: Record<SectionId, string> = {
  overview: "Résultat général",
  corrections: "Corrections",
  explanations: "Explications",
  alternatives: "Formulations naturelles",
  reuse: "Réutilisation",
};

function highlightDiff(original: string, corrected: string): { original: string; corrected: string } {
  if (!corrected || original.trim() === corrected.trim()) {
    return { original, corrected };
  }
  return { original, corrected };
}

export function ComposeAnalysisView(props: ComposeAnalysisViewProps) {
  const {
    mode,
    analysis,
    originalSentence,
    frenchPrompt,
    referenceRussian,
    textId,
    textTitle,
    onPracticeAgain,
    onPracticeAnother,
  } = props;

  const [visibleCount, setVisibleCount] = useState(1);
  const [reviewQueued, setReviewQueued] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setVisibleCount(1);
    const timers = SECTION_ORDER.slice(1).map((_, index) =>
      window.setTimeout(() => setVisibleCount((count) => Math.max(count, index + 2)), (index + 1) * 420),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [analysis, originalSentence]);

  const corrected = analysis.correctedSentence?.trim() || null;
  const diff = highlightDiff(originalSentence, corrected ?? originalSentence);

  const sections = useMemo(() => {
    const items: Array<{ id: SectionId; content: ReactNode }> = [];

    items.push({
      id: "overview",
      content: (
        <div className="compose-analysis-card__body">
          <p className="compose-analysis-card__verdict">{COMPOSE_VERDICT_LABELS[analysis.verdict]}</p>
          <p className="compose-analysis-card__summary">{analysis.summary}</p>
          {analysis.overview ? (
            <div className="compose-overview-grid">
              <div>
                <p className="compose-analysis-card__label">Points forts</p>
                <ul className="compose-bullet-list">
                  {analysis.overview.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="compose-analysis-card__label">Axes d&apos;amélioration</p>
                <ul className="compose-bullet-list">
                  {analysis.overview.improvements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      ),
    });

    if (corrected || (analysis.corrections?.length ?? 0) > 0) {
      items.push({
        id: "corrections",
        content: (
          <div className="compose-analysis-card__body">
            <p className="compose-analysis-card__label">Votre phrase</p>
            <p className="compose-sentence compose-sentence--original break-russian font-reader">{diff.original}</p>
            {corrected ? (
              <>
                <p className="compose-analysis-card__label">Phrase corrigée</p>
                <p className="compose-sentence compose-sentence--corrected break-russian font-reader">{diff.corrected}</p>
              </>
            ) : null}
            {analysis.corrections?.map((entry) => (
              <p key={entry.id} className="compose-correction-diff">
                <span className="compose-correction-diff__from break-russian">{entry.fragment}</span>
                <span aria-hidden>→</span>
                <span className="compose-correction-diff__to break-russian">{entry.corrected}</span>
              </p>
            ))}
          </div>
        ),
      });
    }

    const explanationBlocks = [
      ...(analysis.corrections ?? []).map((entry) => ({
        id: entry.id,
        category: entry.rule,
        note: entry.explanation,
        context: entry.contextNote,
      })),
      ...analysis.linguisticBlocks.map((block) => ({
        id: block.id,
        category: block.category,
        note: block.note,
        context: null as string | null,
        href: block.explorerHref,
      })),
    ];

    if (explanationBlocks.length > 0) {
      items.push({
        id: "explanations",
        content: (
          <div className="compose-analysis-card__body compose-explanation-stack">
            {explanationBlocks.map((block) => (
              <article key={block.id} className="compose-explanation-item">
                <p className="compose-explanation-item__rule">{block.category}</p>
                <p className="compose-explanation-item__note">{block.note}</p>
                {"context" in block && block.context ? (
                  <p className="compose-explanation-item__context">{block.context}</p>
                ) : null}
                {"href" in block && block.href ? (
                  <EditorialReference href={block.href}>Explorer →</EditorialReference>
                ) : null}
              </article>
            ))}
          </div>
        ),
      });
    }

    if (analysis.alternatives.length > 0) {
      items.push({
        id: "alternatives",
        content: (
          <div className="compose-analysis-card__body compose-alternatives">
            {analysis.alternatives.map((alt) => (
              <article key={`${alt.register}-${alt.text}`} className="compose-alternative-card">
                <p className="compose-alternative-card__register">{alt.register}</p>
                <p className="compose-alternative-card__text break-russian font-reader">{alt.text}</p>
                {alt.nuance ? <p className="compose-alternative-card__nuance">{alt.nuance}</p> : null}
              </article>
            ))}
          </div>
        ),
      });
    }

    const hasReuse =
      (analysis.vocabularyLinks?.length ?? 0) > 0 ||
      analysis.authenticExamples.length > 0 ||
      analysis.structures.length > 0;

    if (hasReuse) {
      items.push({
        id: "reuse",
        content: (
          <div className="compose-analysis-card__body compose-reuse">
            {analysis.vocabularyLinks && analysis.vocabularyLinks.length > 0 ? (
              <div>
                <p className="compose-analysis-card__label">Vocabulaire</p>
                <ul className="compose-vocab-links">
                  {analysis.vocabularyLinks.map((link) => {
                    const inReview =
                      reviewQueued[link.savedWordId ?? ""] ||
                      (link.savedWordId ? isVocabularyInReview(link.savedWordId) : false);
                    return (
                      <li key={`${link.word}-${link.label}`} className="compose-vocab-links__item">
                        <div>
                          <p className="compose-vocab-links__word break-russian">{link.word}</p>
                          <p className="compose-vocab-links__meta">
                            {link.encountered ? "Rencontré en lecture" : "Nouveau mot"}
                            {link.label !== link.word ? ` · ${link.label}` : ""}
                          </p>
                        </div>
                        <div className="compose-vocab-links__actions">
                          {link.href ? (
                            <EditorialReference href={link.href}>Fiche →</EditorialReference>
                          ) : null}
                          {link.savedWordId ? (
                            <GhostButton
                              type="button"
                              disabled={inReview}
                              onClick={() => {
                                const saved = getSavedReaderWords().find(
                                  (entry) => entry.id === link.savedWordId,
                                );
                                if (saved) {
                                  enqueueVocabularyReview(saved);
                                  setReviewQueued((current) => ({
                                    ...current,
                                    [saved.id]: true,
                                  }));
                                }
                              }}
                            >
                              {inReview ? "Dans Review" : "Ajouter à Review →"}
                            </GhostButton>
                          ) : link.href ? null : (
                            <EditorialReference href={`/vocabulary?query=${encodeURIComponent(link.label)}`}>
                              Explorer →
                            </EditorialReference>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            {analysis.structures.length > 0 ? (
              <div>
                <p className="compose-analysis-card__label">Structures</p>
                <ul className="compose-inline-links">
                  {analysis.structures.map((structure) => (
                    <li key={structure.label}>
                      <EditorialReference href={structure.href}>{structure.label}</EditorialReference>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {analysis.authenticExamples.length > 0 ? (
              <div>
                <p className="compose-analysis-card__label">Exemples authentiques</p>
                <ul className="compose-authentic-list">
                  {analysis.authenticExamples.map((example) => (
                    <li key={example.href}>
                      <EditorialReference href={example.href}>{example.textTitle}</EditorialReference>
                      <p className="compose-authentic-list__excerpt break-russian font-reader">{example.excerpt}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ),
      });
    }

    return items;
  }, [analysis, corrected, diff.corrected, diff.original, reviewQueued]);

  const visibleSections = sections.slice(0, visibleCount);

  return (
    <div className="practice-shell compose-analysis pb-8">
      <header className="compose-exercise-header">
        <p className="compose-exercise-header__eyebrow">{composeModeLabel(mode)}</p>
        <h1 className="compose-exercise-header__title">Analyse</h1>
        {textTitle && textId ? (
          <p className="compose-exercise-header__source">
            Basé sur <Link href={`/texts/${textId}`}>{textTitle}</Link>
          </p>
        ) : null}
        {frenchPrompt ? (
          <p className="compose-exercise-header__prompt">« {frenchPrompt} »</p>
        ) : null}
        {referenceRussian ? (
          <p className="compose-exercise-header__reference break-russian font-reader">{referenceRussian}</p>
        ) : null}
      </header>

      <div className="compose-analysis-stack">
        {visibleSections.map((section) => (
          <ExerciseCard
            key={section.id}
            title={SECTION_LABELS[section.id]}
            className={[
              "compose-analysis-card",
              `compose-analysis-card--${VERDICT_TONE[analysis.verdict]}`,
              "compose-analysis-card--reveal",
            ].join(" ")}
          >
            {section.content}
          </ExerciseCard>
        ))}
      </div>

      <div className="compose-analysis-actions">
        <PrimaryButton type="button" variant="gold" onClick={onPracticeAgain}>
          Réessayer →
        </PrimaryButton>
        <GhostButton type="button" onClick={onPracticeAnother}>
          Autre exercice →
        </GhostButton>
        <EditorialReference href={composePath({ mode })}>Retour au mode →</EditorialReference>
      </div>
    </div>
  );
}
