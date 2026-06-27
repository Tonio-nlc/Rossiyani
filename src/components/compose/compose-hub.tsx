import Link from "next/link";

import { Card } from "@/components/design-system";
import { COMPOSE_MODE_CARDS } from "@/lib/compose/modes";
import { composePath } from "@/lib/compose/paths";
import {
  buildPostReadingExercises,
  getCompletedReadingTexts,
} from "@/lib/compose/build-post-reading-exercises";

function ComposeModeIcon({ id }: { id: (typeof COMPOSE_MODE_CARDS)[number]["id"] }) {
  if (id === "translation") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M5 7h6v10H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm9-2h5a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-5V5Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 10h2M7 13h2M15 9h3M15 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (id === "reformulation") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M7 6h10v12H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 10h6M9 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 4l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (id === "post_reading") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M6 5.5h12v13H6a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8.5 9h7M8.5 12h5M8.5 15h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 6.5h14v11H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 10h8M8 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ComposeHub() {
  const completedTexts = getCompletedReadingTexts();
  const postReadingCount = completedTexts.reduce(
    (total, text) => total + buildPostReadingExercises(text.textId).length,
    0,
  );

  return (
    <div className="practice-hub compose-hub">
      <header className="lessons-hero practice-hub__intro">
        <p className="r3-eyebrow lessons-hero__eyebrow">Atelier d&apos;écriture</p>
        <h1 className="r3-hero-title lessons-hero__title">Compose</h1>
        <p className="r3-lead lessons-hero__lead">
          Écrivez en russe. Rossiyani analyse, explique et propose des formulations plus naturelles.
        </p>
      </header>

      <section className="lessons-section" aria-label="Modes Compose">
        <div className="lessons-section__head">
          <h2 className="r3-title lessons-section__title">Quatre modes</h2>
        </div>
        <div className="lessons-grid lessons-grid--lessons ws-card-grid ws-card-grid--items">
          {COMPOSE_MODE_CARDS.map((mode) => (
            <div key={mode.id} className="ws-card-grid__cell">
              <Card href={composePath({ mode: mode.id })} className="lessons-lesson-card ws-card practice-mode-card compose-mode-card">
                <header className="ws-card__header">
                  <span className="practice-mode-card__icon lessons-collection-card__cover" aria-hidden>
                    <ComposeModeIcon id={mode.id} />
                  </span>
                  <p className="compose-mode-card__eyebrow">{mode.eyebrow}</p>
                </header>
                <div className="ws-card__body">
                  <h3 className="r3-title ws-card__title lessons-lesson-card__title">{mode.title}</h3>
                  <p className="r3-lead ws-card__desc lessons-lesson-card__desc">{mode.description}</p>
                  {mode.id === "post_reading" && postReadingCount > 0 ? (
                    <p className="compose-mode-card__meta">
                      {postReadingCount} exercice{postReadingCount > 1 ? "s" : ""} disponible
                      {postReadingCount > 1 ? "s" : ""}
                    </p>
                  ) : null}
                </div>
                <footer className="ws-card__footer">
                  <span className="lessons-lesson-card__cta">Commencer →</span>
                </footer>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {completedTexts.length > 0 ? (
        <section className="lessons-section compose-hub__recent" aria-label="Textes terminés">
          <div className="lessons-section__head">
            <h2 className="r3-title lessons-section__title">Après lecture</h2>
            <p className="r3-lead lessons-section__lead">
              Exercices basés sur vos lectures terminées.
            </p>
          </div>
          <ul className="compose-recent-texts">
            {completedTexts.slice(0, 4).map((text) => {
              const exercises = buildPostReadingExercises(text.textId);
              const first = exercises[0];
              if (!first) {
                return null;
              }
              return (
                <li key={text.textId}>
                  <Link
                    href={composePath({
                      mode: "post_reading",
                      textId: text.textId,
                      exercise: first.id,
                    })}
                    className="compose-recent-texts__link"
                  >
                    <span className="compose-recent-texts__title">{text.textTitle}</span>
                    <span className="compose-recent-texts__meta">
                      {exercises.length} exercice{exercises.length > 1 ? "s" : ""} · {text.percent} %
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
