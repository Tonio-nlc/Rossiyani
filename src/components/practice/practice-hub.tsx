import Link from "next/link";

import { PRACTICE_MODE_CARDS } from "@/lib/practice/constants";

export function PracticeHub() {
  return (
    <div className="practice-hub">
      <header className="practice-hub__intro">
        <h1 className="practice-hub__title">Pratique</h1>
        <p className="practice-hub__mission">
          Renforcez le vocabulaire, la grammaire et les structures découverts en lecture.
        </p>
      </header>

      <section className="practice-hub__modes" aria-label="Modes d'exercice">
        <h2 className="practice-hub__modes-label">Modes disponibles</h2>
        <ul className="practice-mode-grid">
          {PRACTICE_MODE_CARDS.map((mode) => (
            <li key={mode.id}>
              <Link href={mode.href} className="practice-mode-card focus-kb">
                <div className="practice-mode-card__body">
                  <p className="practice-mode-card__title">{mode.title}</p>
                  <p className="practice-mode-card__description">{mode.description}</p>
                </div>
                <span className="practice-mode-card__cta">Ouvrir →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
