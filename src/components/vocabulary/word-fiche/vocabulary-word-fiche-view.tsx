"use client";

import Link from "next/link";

import { PlayAudioButton } from "@/components/audio/play-audio-button";
import { formatRelativeEncounter } from "@/lib/vocabulary";
import type { VocabularyWordFiche } from "@/lib/vocabulary/vocabulary-word-fiche-types";

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
  const visibleSections = [
    "comprendre",
    fiche.grammar ? "grammaire" : null,
    fiche.examples.length > 0 ? "exemples" : null,
    fiche.expressions.length > 0 ? "expressions" : null,
    fiche.family.length > 0 ? "famille" : null,
    fiche.linguisticLinks.concepts.length > 0 ||
    fiche.linguisticLinks.collocations.length > 0 ||
    fiche.linguisticLinks.cases.length > 0
      ? "liens"
      : null,
    "revision",
  ].filter((id): id is string => Boolean(id));

  return (
    <article className="vocab-fiche">
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
            {fiche.pronunciationNote ? (
              <div>
                <dt>Prononciation</dt>
                <dd className="break-russian">{fiche.pronunciationNote}</dd>
              </div>
            ) : null}
          </dl>
        </div>
        <div className="vocab-fiche__header-actions">
          {fiche.readerHref ? (
            <Link href={fiche.readerHref} className="vocab-fiche__action focus-kb">
              Lire dans le texte →
            </Link>
          ) : null}
          {fiche.explorerHref ? (
            <Link href={fiche.explorerHref} className="vocab-fiche__action vocab-fiche__action--muted focus-kb">
              Explorer le lemme
            </Link>
          ) : null}
        </div>
      </header>

      <VocabularyWordFicheNav visibleIds={visibleSections} />

      <div className="vocab-fiche__sections">
        <VocabularyWordFicheSection
          id="comprendre"
          title="Comprendre"
          summary={fiche.primaryTranslation}
          defaultOpen
        >
          {fiche.understand.definitions.length > 0 ? (
            <ul className="vocab-fiche-defs">
              {fiche.understand.definitions.map((definition) => (
                <li key={definition.meaning} className="vocab-fiche-defs__item">
                  <p className="vocab-fiche-defs__meaning">{definition.meaning}</p>
                  {definition.note ? (
                    <p className="vocab-fiche-defs__note">{definition.note}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="vocab-fiche__empty">Traduction en cours d&apos;enrichissement.</p>
          )}
          {fiche.understand.nuances ? (
            <p className="vocab-fiche__prose">{fiche.understand.nuances}</p>
          ) : null}
          {fiche.understand.frenchComparison ? (
            <p className="vocab-fiche__prose vocab-fiche__prose--muted">
              {fiche.understand.frenchComparison}
            </p>
          ) : null}
          {fiche.understand.falseFriendWarning ? (
            <p className="vocab-fiche__alert">{fiche.understand.falseFriendWarning}</p>
          ) : null}
        </VocabularyWordFicheSection>

        {fiche.grammar ? (
          <VocabularyWordFicheSection
            id="grammaire"
            title="Fonctionnement grammatical"
            summary={fiche.grammar.title}
          >
            {fiche.grammar.rows.length > 0 ? (
              <dl className="vocab-fiche-rows">
                {fiche.grammar.rows.map((row) => (
                  <div key={`${row.label}-${row.value}`} className="vocab-fiche-rows__row">
                    <dt>{row.label}</dt>
                    <dd className="break-russian">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {fiche.grammar.forms.length > 0 ? (
              <div className="vocab-fiche-forms-wrap">
                <p className="vocab-fiche-forms__label">Formes observées</p>
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
                      {fiche.grammar.forms.map((form) => (
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
            ) : null}
            {fiche.grammar.note ? <p className="vocab-fiche__prose">{fiche.grammar.note}</p> : null}
          </VocabularyWordFicheSection>
        ) : null}

        {fiche.examples.length > 0 ? (
          <VocabularyWordFicheSection id="exemples" title="Exemples" summary={`${fiche.examples.length} phrase(s)`}>
            <ul className="vocab-fiche-examples">
              {fiche.examples.map((example) => (
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

        {fiche.expressions.length > 0 ? (
          <VocabularyWordFicheSection id="expressions" title="Expressions">
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
          </VocabularyWordFicheSection>
        ) : null}

        {fiche.family.length > 0 ? (
          <VocabularyWordFicheSection id="famille" title="Famille de mots">
            <div className="vocab-fiche-chips">
              {fiche.family.map((item) => (
                <LinkChip key={item.href} label={item.label} href={item.href} hint={item.hint} />
              ))}
            </div>
          </VocabularyWordFicheSection>
        ) : null}

        {fiche.linguisticLinks.concepts.length > 0 ||
        fiche.linguisticLinks.collocations.length > 0 ||
        fiche.linguisticLinks.cases.length > 0 ? (
          <VocabularyWordFicheSection id="liens" title="Liens linguistiques">
            {fiche.linguisticLinks.collocations.length > 0 ? (
              <div className="vocab-fiche-link-group">
                <p className="vocab-fiche-link-group__title">Collocations</p>
                <div className="vocab-fiche-chips">
                  {fiche.linguisticLinks.collocations.map((item) => (
                    <LinkChip key={item.href} label={item.label} href={item.href} hint={item.hint} />
                  ))}
                </div>
              </div>
            ) : null}
            {fiche.linguisticLinks.concepts.length > 0 ? (
              <div className="vocab-fiche-link-group">
                <p className="vocab-fiche-link-group__title">Concepts</p>
                <div className="vocab-fiche-chips">
                  {fiche.linguisticLinks.concepts.map((item) => (
                    <LinkChip key={item.href} label={item.label} href={item.href} hint={item.hint} />
                  ))}
                </div>
              </div>
            ) : null}
            {fiche.linguisticLinks.cases.length > 0 ? (
              <div className="vocab-fiche-link-group">
                <p className="vocab-fiche-link-group__title">Cas grammaticaux</p>
                <div className="vocab-fiche-chips">
                  {fiche.linguisticLinks.cases.map((item) => (
                    <LinkChip key={item.href} label={item.label} href={item.href} hint={item.hint} />
                  ))}
                </div>
              </div>
            ) : null}
          </VocabularyWordFicheSection>
        ) : null}

        <VocabularyWordFicheSection id="revision" title="Révision" defaultOpen={false}>
          <VocabularyWordReviewPanel fiche={fiche} />
        </VocabularyWordFicheSection>
      </div>
    </article>
  );
}
