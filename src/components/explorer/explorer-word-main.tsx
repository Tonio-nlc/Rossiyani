import Link from "next/link";

import { formatCaseLabelFr } from "@/features/grammar";

import type { ExplorerWordPresentation } from "./explorer-word-presentation";
import { textPath } from "./explorer-routes";

type ExplorerWordMainProps = {
  presentation: ExplorerWordPresentation;
  breadcrumb?: Array<{ label: string; href?: string }>;
};

function SectionBookIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden className="explorer-word-section__icon">
      <path d="M3.5 3h11v12H3.5z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6.5 6.5h5M6.5 9.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SectionEtymologyIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden className="explorer-word-section__icon">
      <path
        d="M9 15V6.5M9 6.5C7.1 6.5 5.5 5.1 5.5 3.25S7.1 0 9 0s3.5 1.35 3.5 3.25S10.9 6.5 9 6.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export function ExplorerWordMain({ presentation, breadcrumb }: ExplorerWordMainProps) {
  const primaryLesson = presentation.relatedLessons[0];
  const showConjugation =
    presentation.forms.length > 0 ||
    presentation.partOfSpeech.toLowerCase().includes("verbe") ||
    presentation.badges.some((badge) => badge.toLowerCase().includes("verbe"));

  return (
    <article className="explorer-word">
      {breadcrumb && breadcrumb.length > 0 ? (
        <nav className="explorer-word__crumb" aria-label="Fil d'Ariane">
          {breadcrumb.map((item, index) => (
            <span key={`${item.label}-${index}`}>
              {item.href ? (
                <Link href={item.href} className="explorer-word__crumb-link focus-kb">
                  {item.label}
                </Link>
              ) : (
                <span className="explorer-word__crumb-current">{item.label}</span>
              )}
              {index < breadcrumb.length - 1 ? (
                <span className="explorer-word__crumb-sep" aria-hidden>
                  /
                </span>
              ) : null}
            </span>
          ))}
        </nav>
      ) : null}

      <header className="explorer-word__hero">
        <div className="explorer-word__headline">
          <h1 className="explorer-word__lemma break-russian">{presentation.label}</h1>
          {presentation.transcription ? (
            <p className="explorer-word__transcription">{presentation.transcription}</p>
          ) : null}
        </div>
        {presentation.badges.length > 0 ? (
          <ul className="explorer-word__badges">
            {presentation.badges.map((badge) => (
              <li key={badge}>
                <span className="explorer-word__badge">{badge}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {presentation.metadataLine ? (
          <p className="explorer-word__meta">{presentation.metadataLine}</p>
        ) : null}
        {presentation.heroSummary ? (
          <p className="explorer-word__summary">{presentation.heroSummary}</p>
        ) : null}
      </header>

      <hr className="explorer-word__rule" />

      <ul className="explorer-word__actions">
        <li>
          <Link href={presentation.practiceHref} className="explorer-word__action focus-kb">
            Pratiquer →
          </Link>
        </li>
        {presentation.readExamplesHref ? (
          <li>
            <Link href={presentation.readExamplesHref} className="explorer-word__action focus-kb">
              Lire →
            </Link>
          </li>
        ) : null}
        {primaryLesson ? (
          <li>
            <Link
              href={`/manual/lecons/${primaryLesson.slug}`}
              className="explorer-word__action focus-kb"
            >
              Leçon →
            </Link>
          </li>
        ) : null}
        <li>
          <Link href={presentation.exploreHref} className="explorer-word__action focus-kb">
            Explorer →
          </Link>
        </li>
      </ul>

      <section id="definitions" className="explorer-word-section">
        <h2 className="explorer-word-section__title">
          <SectionBookIcon />
          Définitions
        </h2>
        <ol className="explorer-word-definitions">
          {presentation.definitions.map((definition, index) => (
            <li key={`${definition.text}-${index}`} className="explorer-word-definitions__item">
              <p className="explorer-word-definitions__text">{definition.text}</p>
              {definition.example ? (
                <div className="explorer-word-example">
                  <p className="explorer-word-example__russian break-russian font-reader">
                    {definition.example.russian}
                  </p>
                  {definition.example.translation ? (
                    <p className="explorer-word-example__translation">
                      {definition.example.translation}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      {presentation.etymology ? (
        <section id="etymology" className="explorer-word-section">
          <h2 className="explorer-word-section__title">
            <SectionEtymologyIcon />
            Étymologie
          </h2>
          <p className="explorer-word-section__prose">{presentation.etymology}</p>
        </section>
      ) : null}

      {presentation.usage ? (
        <section id="usage" className="explorer-word-section">
          <h2 className="explorer-word-section__title">Usage</h2>
          <p className="explorer-word-section__prose">{presentation.usage}</p>
        </section>
      ) : null}

      {showConjugation ? (
        <section id="conjugation" className="explorer-word-section">
          <h2 className="explorer-word-section__title">Conjugaison</h2>
          {presentation.forms.length > 0 ? (
            <div className="explorer-word-forms-wrap">
              <table className="explorer-word-forms">
                <thead>
                  <tr>
                    <th scope="col">Forme</th>
                    <th scope="col">Cas</th>
                    <th scope="col">Term.</th>
                  </tr>
                </thead>
                <tbody>
                  {presentation.forms.map((form) => (
                    <tr key={form.id}>
                      <td className="explorer-word-forms__form break-russian font-reader">
                        {form.original}
                      </td>
                      <td>{formatCaseLabelFr(form.case) ?? "—"}</td>
                      <td>{form.ending || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="explorer-word-section__prose">
              <Link href={presentation.practiceHref} className="explorer-word__action focus-kb">
                Ouvrir la pratique →
              </Link>
            </p>
          )}
        </section>
      ) : null}

      {presentation.extraExamples.length > 0 ? (
        <section className="explorer-word-section explorer-word-section--archive">
          <h2 className="explorer-word-section__title explorer-word-section__title--subtle">
            Autres exemples
          </h2>
          <ul className="explorer-word-archive-list">
            {presentation.extraExamples.map((example, index) => (
              <li key={`${example.russian}-${index}`} className="explorer-word-example">
                <p className="explorer-word-example__russian break-russian font-reader">
                  {example.russian}
                </p>
                {example.translation ? (
                  <p className="explorer-word-example__translation">{example.translation}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {presentation.relatedConcepts.length > 0 ? (
        <section className="explorer-word-section explorer-word-section--archive">
          <h2 className="explorer-word-section__title explorer-word-section__title--subtle">
            Concepts liés
          </h2>
          <ul className="explorer-word-link-list">
            {presentation.relatedConcepts.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="explorer-word-link-list__link focus-kb">
                  {item.label}
                  {item.meta ? (
                    <span className="explorer-word-link-list__meta">{item.meta}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {presentation.relatedGrammar.length > 0 ? (
        <section className="explorer-word-section explorer-word-section--archive">
          <h2 className="explorer-word-section__title explorer-word-section__title--subtle">
            Grammaire liée
          </h2>
          <ul className="explorer-word-link-list">
            {presentation.relatedGrammar.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="explorer-word-link-list__link focus-kb">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {presentation.relatedTexts.length > 0 ? (
        <section className="explorer-word-section explorer-word-section--archive">
          <h2 className="explorer-word-section__title explorer-word-section__title--subtle">
            Dans vos textes
          </h2>
          <ul className="explorer-word-archive-list">
            {presentation.relatedTexts.map((text) => (
              <li key={`${text.textId ?? text.russian}`}>
                {text.textId ? (
                  <Link href={textPath(text.textId)} className="explorer-word-text-link focus-kb">
                    {text.textTitle ? (
                      <span className="explorer-word-text-link__title">{text.textTitle}</span>
                    ) : null}
                    <span className="explorer-word-text-link__russian break-russian font-reader">
                      {text.russian}
                    </span>
                  </Link>
                ) : (
                  <div className="explorer-word-example">
                    <p className="explorer-word-example__russian break-russian font-reader">
                      {text.russian}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {presentation.relatedLessons.length > 0 ? (
        <section className="explorer-word-section explorer-word-section--archive">
          <h2 className="explorer-word-section__title explorer-word-section__title--subtle">
            Leçons Manual
          </h2>
          <ul className="explorer-word-link-list">
            {presentation.relatedLessons.map((lesson) => (
              <li key={lesson.slug}>
                <Link
                  href={`/manual/lecons/${lesson.slug}`}
                  className="explorer-word-link-list__link focus-kb"
                >
                  {lesson.title}
                  <span className="explorer-word-link-list__meta">{lesson.level}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {presentation.continueExploring.length > 0 ? (
        <section className="explorer-word-section explorer-word-section--archive">
          <h2 className="explorer-word-section__title explorer-word-section__title--subtle">
            Poursuivre l&apos;exploration
          </h2>
          <ul className="explorer-word-link-list">
            {presentation.continueExploring.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="explorer-word-link-list__link focus-kb">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
