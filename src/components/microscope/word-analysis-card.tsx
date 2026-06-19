import type { ReactNode } from "react";

import { POS_LABELS_FR } from "@/features/grammar";
import {
  buildFunctionWordGrammarFields,
  isInflectedAnalysisPos,
  type GrammarCardContext,
} from "@/lib/formatting/grammar-card-fields";
import { resolveEffectiveGender } from "@/lib/formatting/resolve-effective-gender";
import { resolveWordSemanticData } from "@/lib/formatting/resolve-word-semantic-data";
import {
  buildMorphologyDisplayFields,
  buildStemEndingDisplay,
  shouldShowLemma,
  shouldShowStemEnding,
  shouldShowStress,
} from "@/lib/formatting/word-morphology-display";
import type { WordDetailGraph } from "@/types/word-detail-graph";

import { WordTranslationSection } from "./word-translation-sections";

type WordAnalysisCardProps = {
  detail: WordDetailGraph;
  context?: GrammarCardContext;
  analysisComplete?: boolean;
  isUnrecognizedWord?: boolean;
};

function PartialAnalysisNotice() {
  return (
    <div className="ds-microscope-panel">
      <p className="ds-microscope-panel-title">Statut</p>
      <p className="mt-1 text-sm text-[var(--ink)]">Analyse estimée</p>
    </div>
  );
}

function UnrecognizedWordBadge() {
  return (
    <div className="ds-microscope-panel">
      <p className="text-exception text-[10px] font-semibold uppercase tracking-wide">
        Mot non reconnu
      </p>
      <p className="mt-1 text-xs leading-snug text-[var(--ink-muted)]">
        Ce mot n&apos;existe pas encore dans la bibliothèque linguistique.
      </p>
    </div>
  );
}

function InfoField({
  label,
  children,
  className = "",
  valueClassName = "",
  fullWidth = false,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  valueClassName?: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={`min-w-0 ${fullWidth ? "sm:col-span-2" : ""} ${className}`}>
      <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </dt>
      <dd
        className={[
          "mt-0.5 font-reader text-sm leading-snug text-[var(--foreground)]",
          valueClassName,
        ].join(" ")}
      >
        {children}
      </dd>
    </div>
  );
}

function PosBadge({ partOfSpeech }: { partOfSpeech: string }) {
  const label = POS_LABELS_FR[partOfSpeech as keyof typeof POS_LABELS_FR] ?? partOfSpeech;
  return (
    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
      {label}
    </p>
  );
}

function WordIntelligenceBody({
  detail,
  context,
  analysisComplete,
}: {
  detail: WordDetailGraph;
  context?: GrammarCardContext;
  analysisComplete: boolean;
}) {
  const { occurrence } = detail;
  const semantic = resolveWordSemanticData(detail);
  const translation = {
    primaryMeanings: semantic.primaryMeanings,
    extraMeanings: semantic.extraMeanings,
    posEmoji: semantic.posEmoji,
    isEstimated: semantic.estimated,
    source: semantic.translationSource,
    confidence: semantic.confidence,
  };
  const explanation = semantic.explanation;
  const inflected = isInflectedAnalysisPos(occurrence.partOfSpeech);
  const showLemma = shouldShowLemma(occurrence, { forceWhenIncomplete: !analysisComplete });
  const showStemEnding = shouldShowStemEnding(occurrence);
  const showStress = shouldShowStress(occurrence);
  const stemEnding = buildStemEndingDisplay(occurrence);

  const effectiveGender = resolveEffectiveGender(occurrence, detail);

  const morphFields = inflected
    ? buildMorphologyDisplayFields(occurrence, { gender: effectiveGender }).filter(
        (field) => field.label !== "Lemme",
      )
    : [];

  const grammarFields = inflected
    ? []
    : buildFunctionWordGrammarFields(detail, context);

  return (
    <>
      <InfoField label="Forme">
        <span
          className="font-reader text-2xl font-bold leading-none sm:text-[1.75rem]"
          data-shared-element="word-hero"
        >
          {occurrence.original}
        </span>
      </InfoField>

      {showLemma ? (
        <InfoField label={analysisComplete ? "Lemme" : "Lemme estimé"}>
          <span className="font-reader text-lg">{occurrence.lemma}</span>
        </InfoField>
      ) : null}

      <WordTranslationSection translation={translation} />

      {!inflected || !analysisComplete ? (
        <PosBadge partOfSpeech={occurrence.partOfSpeech} />
      ) : null}

      {showStemEnding && stemEnding ? (
        <InfoField label="Radical + terminaison">
          {(() => {
            const [stemPart, endingPart] = stemEnding.split(" + ");
            return (
              <span>
                {stemPart}
                <span className="text-[var(--accent-violet-bright)]"> + {endingPart}</span>
              </span>
            );
          })()}
        </InfoField>
      ) : null}

      {morphFields.length > 0 ? (
        <div
          className={[
            "grid gap-x-4 gap-y-2.5",
            morphFields.length >= 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2",
          ].join(" ")}
        >
          {morphFields.map((field) => (
            <InfoField key={field.label} label={field.label}>
              {field.value}
            </InfoField>
          ))}
        </div>
      ) : null}

      {grammarFields.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
          {grammarFields.map((field) => (
            <InfoField
              key={field.label}
              label={field.label}
              fullWidth={
                field.label === "Fonction" ||
                field.label === "Usage" ||
                field.label === "Exemple" ||
                field.label === "Autre construction"
              }
              valueClassName={
                field.label === "Fonction" || field.label === "Usage" ? "text-[var(--muted)]" : ""
              }
            >
              {field.value}
            </InfoField>
          ))}
        </div>
      ) : null}

      {showStress ? (
        <InfoField label="Accent" valueClassName="text-[var(--foreground)]/90">
          {occurrence.stressMarked}
        </InfoField>
      ) : null}

      <InfoField label="Explication" fullWidth valueClassName="text-[var(--muted)]">
        {explanation}
      </InfoField>
    </>
  );
}

export function WordAnalysisCard({
  detail,
  context,
  analysisComplete = true,
  isUnrecognizedWord = false,
}: WordAnalysisCardProps) {
  return (
    <article className="animate-microscope-in ds-microscope-panel" aria-label="Analyse du mot">
      <dl className="space-y-3">
        {!analysisComplete ? <PartialAnalysisNotice /> : null}
        {isUnrecognizedWord ? <UnrecognizedWordBadge /> : null}
        <WordIntelligenceBody
          detail={detail}
          context={context}
          analysisComplete={analysisComplete}
        />
      </dl>
    </article>
  );
}
