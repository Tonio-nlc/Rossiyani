import { Card } from "@/components/design-system";

function PlusIcon() {
  return (
    <svg className="library-ws-suggest__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.1" />
      <path d="M12 7.5v9M7.5 12h9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function LibrarySuggestCard() {
  return (
    <Card href="/import" className="lessons-lesson-card ws-card library-ws-suggest">
      <header className="ws-card__header">
        <PlusIcon />
      </header>
      <div className="ws-card__body">
        <h3 className="r3-title ws-card__title library-ws-suggest__title">Suggérer un texte</h3>
        <p className="r3-lead ws-card__desc library-ws-suggest__lead">
          Vous cherchez un sujet spécifique&nbsp;? Faites-le nous savoir.
        </p>
      </div>
      <footer className="ws-card__footer">
        <span className="lessons-lesson-card__cta">Importer →</span>
      </footer>
    </Card>
  );
}
