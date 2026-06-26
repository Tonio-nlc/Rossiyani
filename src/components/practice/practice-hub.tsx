import Link from "next/link";

import { Card } from "@/components/design-system";
import { PRACTICE_MODE_CARDS } from "@/lib/practice/constants";

function PracticeModeIcon({ id }: { id: (typeof PRACTICE_MODE_CARDS)[number]["id"] }) {
  if (id === "sentence") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M7 6.5h10a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M9 10h6M9 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (id === "context-translation") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M5 7.5h8v9H5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Zm11-2h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-3V5.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M7 10.5h4M7 13.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 5.5h5v13H6a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Zm8 0h4a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-5V5.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M8.5 9.5h2M8.5 12.5h2M14.5 9.5h2M14.5 12.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PracticeHub() {
  return (
    <div className="practice-hub">
      <header className="practice-hub__intro">
        <h1 className="r3-hero-title practice-hub__title">Pratique</h1>
        <p className="r3-lead practice-hub__mission">
          Renforcez le vocabulaire, la grammaire et les structures découverts en lecture.
        </p>
      </header>

      <section className="practice-hub__modes" aria-label="Modes d'exercice">
        <h2 className="r3-title practice-hub__modes-label">Modes disponibles</h2>
        <ul className="practice-mode-grid">
          {PRACTICE_MODE_CARDS.map((mode) => (
            <li key={mode.id}>
              <Card href={mode.href} className="practice-mode-card">
                <span className="practice-mode-card__icon" aria-hidden>
                  <PracticeModeIcon id={mode.id} />
                </span>
                <div className="practice-mode-card__body">
                  <p className="r3-title practice-mode-card__title">{mode.title}</p>
                  <p className="r3-lead practice-mode-card__description">{mode.description}</p>
                </div>
                <span className="practice-mode-card__cta">Ouvrir →</span>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
