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
    <Card href="/import" className="library-ws-suggest">
      <PlusIcon />
      <h3 className="r3-title library-ws-suggest__title">Suggérer un texte</h3>
      <p className="r3-lead library-ws-suggest__lead">
        Vous cherchez un sujet spécifique&nbsp;? Faites-le nous savoir.
      </p>
    </Card>
  );
}
