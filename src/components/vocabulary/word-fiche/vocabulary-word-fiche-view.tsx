"use client";

import Link from "next/link";

import { PlayAudioButton } from "@/components/audio/play-audio-button";
import { ReaderPatternCard } from "@/components/reader/reader-pattern-card";
import type { VocabularyWordFiche } from "@/lib/vocabulary/vocabulary-word-fiche-types";

import { useVocabularyPatternExperience } from "./use-vocabulary-pattern-experience";
import { VocabularyWordFicheNav } from "./vocabulary-word-fiche-nav";
import { VocabularyWordFicheSection } from "./vocabulary-word-fiche-section";
import { VocabularyWordReviewPanel } from "./vocabulary-word-review-panel";

type VocabularyWordFicheViewProps = {
  fiche: VocabularyWordFiche;
};

function LinkChip({ label, href, hint }: { label: string; href: string; hint?: string | null }) {
  return (
    <Link href={href} className="vocab-fiche-chip focus-kb">
      <span className="vocab-fiche-chip__label break-russian">{label}</span>
      {hint ? <span className="vocab-fiche-chip__hint">{hint}</span> : null}
    </Link>
  );
}

export function VocabularyWordFicheView({ fiche }: VocabularyWordFicheViewProps) {
  const patternExperienceById = useVocabularyPatternExperience(
    fiche.patternSlice.patterns,
    fiche.review.sourceTextId,
    fiche.review.sourceTextTitle,
  );

  const visibleSections = [
    "pourquoi",
    fiche.patternSlice.whatToNotice ? "remarquer" : null,
    fiche.patternSlice.patterns.length > 0 ? "patterns" : null,
    fiche.encounteredExamples.length > 0 ? "exemples" : null,
    fiche.family.length > 0 ? "famille" : null,
    fiche.variants.length > 0 ? "variantes" : null,
    "details",
  ].filter((id): id is string => Boolean(id));

  return (
    <article className="vocab-fiche vocab-fiche--pattern-first">
      <header className="vocab-fiche__header">
        <div className="vocab-fiche__header-main">
          <p className="vocab-fiche__eyebrow">{fiche.partOfSpeechLabel}</p>
          <div className="vocab-fiche__headline-row">
            <h1 className="vocab-fiche__headline break-russian">{fiche.headline}</h1>
            <PlayAudioButton
              target={fiche.audioTarget}
              label="Écouter le mot"
              className="vocab-fiche__audio focus-kb"
              iconClassName="vocab-fiche__audio-icon"
            />
          </div>
          {fiche.primaryTranslation ? (
            <p className="vocab-fiche__translation">{fiche.primaryTranslation}</p>
          ) : null}
          <dl className="vocab-fiche__meta">
            {fiche.cefrLevel ? (
              <div>
                <dt>Niveau</dt>
                <dd>{fiche.cefrLevel}</dd>
              </div>
            ) : null}
            {fiche.frequencyLabel ? (
              <div>
                <dt>Fréquence</dt>
                <dd>{fiche.frequencyLabel}</dd>
              </div>
            ) : null}
          </dl>
        </div>
        {fiche.readerHref ? (
          <div className="vocab-fiche__header-actions">
            <Link href={fiche.readerHref} className="vocab-fiche__action focus-kb">
              Relire dans le texte →
            </Link>
          </div>
        ) : null}
      </header>

      <VocabularyWordFicheNav visibleIds={visibleSections} />

      <div className="vocab-fiche__sections">
        <VocabularyWordFicheSection
          id="pourquoi"
          title="Pourquoi ce mot compte"
          summary={fiche.primaryTranslation}
          defaultOpen
        >
          <p className="vocab-fiche__lead">{fiche.patternSlice.whyItMatters}</p>
        </VocabularyWordFicheSection>

        {fiche.patternSlice.whatToNotice ? (
          <VocabularyWordFicheSection
            id="remarquer"
            title="Ce qu'il faut remarquer"
            defaultOpen={fiche.patternSlice.patterns.length === 0}
          >
            <p className="vocab-fiche__prose">{fiche.patternSlice.whatToNotice}</p>
          </VocabularyWordFicheSection>
        ) : null}

        {fiche.patternSlice.patterns.length > 0 ? (
          <VocabularyWordFicheSection
            id="patterns"
            title="Idées russes associées"
            summary={`${fiche.patternSlice.patterns.length} pattern${fiche.patternSlice.patterns.length > 1 ? "s" : ""}`}
            defaultOpen
          >
            <div className="vocab-fiche-patterns">
              {fiche.patternSlice.patterns.map((pattern) => {
                const experience = patternExperienceById.get(pattern.id);
                if (!experience?.visible) {
                  return (
                    <article key={pattern.id} className="vocab-fiche-pattern-fallback">
                      <h3 className="vocab-fiche-pattern-fallback__title">{pattern.userFacingName}</h3>
                      <p className="vocab-fiche-pattern-fallback__copy">{pattern.insight}</p>
                    </article>
                  );
                }
                return <ReaderPatternCard key={pattern.id} experience={experience} />;
              })}
            </div>
          </VocabularyWordFicheSection>
        ) : null}

        {fiche.encounteredExamples.length > 0 ? (
          <VocabularyWordFicheSection
            id="exemples"
            title="Exemples déjà rencontrés"
            summary={`${fiche.encounteredExamples.length} phrase(s)`}
          >
            <ul className="vocab-fiche-examples">
              {fiche.encounteredExamples.map((example) => (
                <li key={example.id} className="vocab-fiche-examples__item">
                  <div className="vocab-fiche-examples__head">
                    <p className="vocab-fiche-examples__russian break-russian">{example.russian}</p>
                    <PlayAudioButton
                      target={{
                        scope: "utterance",
                        text: example.russian,
                        cacheKey: example.audioCacheKey,
                      }}
                      label="Écouter l'exemple"
                      className="vocab-fiche-examples__audio focus-kb"
                      iconClassName="vocab-fiche-examples__audio-icon"
                    />
                  </div>
                  {example.translation ? (
                    <p className="vocab-fiche-examples__translation">{example.translation}</p>
                  ) : null}
                  {example.textHref && example.textTitle ? (
                    <Link href={example.textHref} className="vocab-fiche-examples__source focus-kb">
                      {example.textTitle} →
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </VocabularyWordFicheSection>
        ) : null}

        {fiche.family.length > 0 ? (
          <VocabularyWordFicheSection id="famille" title="Famille lexicale">
            <div className="vocab-fiche-chips">
              {fiche.family.map((item) => (
                <LinkChip key={item.href} label={item.label} href={item.href} hint={item.hint} />
              ))}
            </div>
          </VocabularyWordFicheSection>
        ) : null}

        {fiche.variants.length > 0 ? (
          <VocabularyWordFicheSection
            id="variantes"
            title="Variantes fréquentes"
            summary={`${fiche.variants.length} forme(s)`}
          >
            <div className="vocab-fiche-forms-wrap">
              <div className="vocab-fiche-forms">
                <table className="vocab-fiche-forms__table">
                  <thead>
                    <tr>
                      <th>Forme</th>
                      <th>Cas</th>
                      <th>Genre</th>
                      <th>Nombre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fiche.variants.map((form) => (
                      <tr key={form.id}>
                        <td className="break-russian">{form.form}</td>
                        <td>{form.case ?? "—"}</td>
                        <td>{form.gender ?? "—"}</td>
                        <td>{form.number ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </VocabularyWordFicheSection>
        ) : null}

        <VocabularyWordFicheSection
          id="details"
          title="Détails linguistiques"
          summary="Grammaire, nuances, révision"
          defaultOpen={false}
        >
          {fiche.linguistic.definitions.length > 0 ? (
            <ul className="vocab-fiche-defs">
              {fiche.linguistic.definitions.map((definition) => (
                <li key={definition.meaning} className="vocab-fiche-defs__item">
                  <p className="vocab-fiche-defs__meaning">{definition.meaning}</p>
                  {definition.note ? (
                    <p className="vocab-fiche-defs__note">{definition.note}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
          {fiche.linguistic.nuances ? (
            <p className="vocab-fiche__prose">{fiche.linguistic.nuances}</p>
          ) : null}
          {fiche.linguistic.frenchComparison ? (
            <p className="vocab-fiche__prose vocab-fiche__prose--muted">
              {fiche.linguistic.frenchComparison}
            </p>
          ) : null}
          {fiche.linguistic.falseFriendWarning ? (
            <p className="vocab-fiche__alert">{fiche.linguistic.falseFriendWarning}</p>
          ) : null}

          {fiche.linguistic.grammar ? (
            <div className="vocab-fiche-details-block">
              <h3 className="vocab-fiche-details-block__title">{fiche.linguistic.grammar.title}</h3>
              {fiche.linguistic.grammar.rows.length > 0 ? (
                <dl className="vocab-fiche-rows">
                  {fiche.linguistic.grammar.rows.map((row) => (
                    <div key={`${row.label}-${row.value}`} className="vocab-fiche-rows__row">
                      <dt>{row.label}</dt>
                      <dd className="break-russian">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {fiche.linguistic.grammar.note ? (
                <p className="vocab-fiche__prose">{fiche.linguistic.grammar.note}</p>
              ) : null}
            </div>
          ) : null}

          {fiche.linguistic.collocations.length > 0 ? (
            <div className="vocab-fiche-link-group">
              <p className="vocab-fiche-link-group__title">Collocations</p>
              <div className="vocab-fiche-chips">
                {fiche.linguistic.collocations.map((item) => (
                  <LinkChip key={item.href} label={item.label} href={item.href} hint={item.hint} />
                ))}
              </div>
            </div>
          ) : null}

          {fiche.expressions.length > 0 ? (
            <div className="vocab-fiche-details-block">
              <h3 className="vocab-fiche-details-block__title">Expressions liées</h3>
              <ul className="vocab-fiche-expr-list">
                {fiche.expressions.map((expression) => (
                  <li key={expression.id} className="vocab-fiche-expr-list__item">
                    <p className="vocab-fiche-expr-list__label break-russian">{expression.label}</p>
                    <p className="vocab-fiche-expr-list__meta">
                      {expression.typeLabel}
                      {expression.occurrenceCount > 1
                        ? ` · ${expression.occurrenceCount} occurrences`
                        : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="vocab-fiche-details-block">
            <h3 className="vocab-fiche-details-block__title">Révision</h3>
            <VocabularyWordReviewPanel fiche={fiche} />
          </div>
        </VocabularyWordFicheSection>
      </div>
    </article>
  );
}
